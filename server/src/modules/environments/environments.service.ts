import { pool } from "../../db/pool";
import { AppError } from "../../utils/AppError";

type CheckProfileEnvironmentRequest = {
  userId: string;
  userSettings: {
    timezone: string | null;
    cityId: number | null;
    languageCode: string | null;
  };
  reqValues: {
    timezone: string;
    latitude: number | null;
    longitude: number | null;
  };
};

type SuggestedLocationRow = {
  city_id: number;
  city_name: string;
  country_code: string;
  country_name: string;
  distance_meters: string;
};

type CheckProfileEnvironmentResult = {
  timezoneUpdated: boolean;
  positionChecked: boolean;
  locationChanged: boolean;
  suggestedLocation: {
    cityId: number;
    cityName: string;
    countryCode: string;
    countryName: string;
    distanceMeters: string;
  } | null;
};

const LOCATION_CHANGE_DISTANCE_METERS = 100_000;

export async function checkProfileEnvironment({
  userId,
  userSettings,
  reqValues,
}: CheckProfileEnvironmentRequest): Promise<CheckProfileEnvironmentResult> {
  const { timezone, latitude, longitude } = reqValues;

  const normalizedTimezone = timezone.trim() || "UTC";

  const timezoneUpdated = normalizedTimezone !== userSettings.timezone;

  const hasValidCoordinates =
    latitude !== null &&
    longitude !== null &&
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    if (timezoneUpdated) {
      await client.query(
        `
          UPDATE user_settings
          SET timezone = $1
          WHERE user_id = $2
        `,
        [normalizedTimezone, userId]
      );
    }

    if (!hasValidCoordinates) {
      await client.query("COMMIT");

      return {
        timezoneUpdated,
        positionChecked: false,
        locationChanged: false,
        suggestedLocation: null,
      };
    }

    const langCode = userSettings.languageCode ?? "en";

    const suggestedLocationResult = await client.query<SuggestedLocationRow>(
      `
          WITH user_point AS (
            SELECT
              ST_SetSRID(
                ST_MakePoint($1::double precision, $2::double precision),
                4326
              )::geography AS location
          ),

          current_city AS (
            SELECT
              c.id,
              c.location
            FROM cities c
            WHERE c.id = $3
            LIMIT 1
          ),

          nearest_city AS (
            SELECT
              c.id,
              c.country_code,
              c.international_name,
              c.location
            FROM cities c
            CROSS JOIN user_point up
            WHERE c.location IS NOT NULL
              AND c.feature_code IN (
                'PPLC',
                'PPLA',
                'PPLA2',
                'PPLA3',
                'PPLA4',
                'PPL'
              )
              AND COALESCE(c.population, 0) >= 100000
            ORDER BY c.location <-> up.location
            LIMIT 1
          )

          SELECT
            nc.id AS city_id,

            COALESCE(
              cl.translation,
              nc.international_name
            ) AS city_name,

            nc.country_code::text AS country_code,

            COALESCE(
              cnl.translation,
              countries.name
            ) AS country_name,

            ST_Distance(
              nc.location,
              up.location
            )::text AS distance_meters

          FROM user_point up

          JOIN nearest_city nc
            ON true

          JOIN countries
            ON countries.code = nc.country_code

          LEFT JOIN current_city cc
            ON true

          LEFT JOIN cities_lang cl
            ON cl.city_id = nc.id
            AND cl.lang_code = $4

          LEFT JOIN countries_lang cnl
            ON cnl.word_code = nc.country_code::text
            AND cnl.lang_code = $4

          WHERE
            cc.id IS NULL
            OR
            cc.location IS NULL

            OR
            ST_Distance(
              cc.location,
              up.location
            ) > $5

          LIMIT 1
        `,
      [
        longitude,
        latitude,
        userSettings.cityId,
        langCode,
        LOCATION_CHANGE_DISTANCE_METERS,
      ]
    );

    const suggestedLocationRow = suggestedLocationResult.rows[0] ?? null;

    await client.query(
      `
        UPDATE user_settings
        SET last_check_position = now()
        WHERE user_id = $1
      `,
      [userId]
    );

    await client.query("COMMIT");

    return {
      timezoneUpdated,
      positionChecked: true,
      locationChanged: suggestedLocationRow !== null,
      suggestedLocation: suggestedLocationRow
        ? {
            cityId: suggestedLocationRow.city_id,
            cityName: suggestedLocationRow.city_name,
            countryCode: suggestedLocationRow.country_code,
            countryName: suggestedLocationRow.country_name,
            distanceMeters: suggestedLocationRow.distance_meters,
          }
        : null,
    };
  } catch (error: unknown) {
    await client.query("ROLLBACK");

    if (error instanceof AppError) {
      throw error;
    }

    if (isPostgresError(error)) {
      throw new AppError(
        400,
        error.code ?? "DATABASE_ERROR",
        error.detail ?? error.message ?? "Database error"
      );
    }

    throw error;
  } finally {
    client.release();
  }
}

type PostgresError = {
  severity?: string;
  code?: string;
  detail?: string;
  message?: string;
};

function isPostgresError(error: unknown): error is PostgresError {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const candidate = error as PostgresError;

  return candidate.severity === "ERROR" || typeof candidate.code === "string";
}

type LocationProps = {
  countryCode: string;
  cityId: number;
};

type ChangeProfileLocationParams = {
  userId: string;
  languageCode: string;
  locationValues: LocationProps;
};

type CountryRow = {
  country_code: string;
  country_name: string;
};

type CityRow = {
  city_id: number;
  city_name: string;
};

type UpdatedLocationRow = {
  country_name: string;
  city_name: string;
  city_id: number;
  country_code: string;
};

type ChangeProfileLocationResponse = {
  countryCode: string;
  countryName: string;
  cityId: number;
  cityName: string;
};

export async function changeProfileLocation({
  userId,
  languageCode,
  locationValues,
}: ChangeProfileLocationParams): Promise<ChangeProfileLocationResponse> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const countryResult = await client.query<CountryRow>(
      `
      SELECT 
        cs.code AS country_code, 
        COALESCE(cls.translation, cs.name) AS country_name
      FROM countries cs
        LEFT JOIN countries_lang cls 
        ON cls.word_code = cs.code 
        AND cls.lang_code = $2
      WHERE cs.code = $1
      LIMIT 1
      `,
      [locationValues.countryCode, languageCode]
    );

    if (countryResult.rows.length === 0) {
      throw new AppError(404, "COUNTRY_NOT_FOUND", "Country not found");
    }

    const cityResult = await client.query<CityRow>(
      `
      SELECT 
        cs.id AS city_id,
        COALESCE(csl."translation", cs.local_name) AS city_name
      FROM cities cs
      LEFT JOIN cities_lang csl ON csl.city_id = cs.id AND csl.lang_code = $3
      WHERE cs.id = $1 AND cs.country_code = $2
      LIMIT 1
      `,
      [locationValues.cityId, locationValues.countryCode, languageCode]
    );

    if (cityResult.rows.length === 0) {
      throw new AppError(
        404,
        "CITY_NOT_FOUND",
        "City not found for selected country"
      );
    }

    const userSettingsResult = await client.query<UpdatedLocationRow>(
      `
        UPDATE user_settings
        SET country_code = $2, country_name = $3, city_id = $4, city_name = $5
        WHERE user_id = $1
        RETURNING country_name, city_name, city_id, country_code
      `,
      [
        userId,
        countryResult.rows[0].country_code,
        countryResult.rows[0].country_name,
        cityResult.rows[0].city_id,
        cityResult.rows[0].city_name,
      ]
    );

    if (userSettingsResult.rows.length === 0) {
      throw new AppError(
        404,
        "USER_SETTINGS_DOESNT_UPDATE",
        "User setting doesnt update"
      );
    }

    const resultNewLocation = userSettingsResult.rows[0];
    await client.query("COMMIT");

    return {
      countryCode: resultNewLocation.country_code,
      countryName: resultNewLocation.country_name,
      cityId: resultNewLocation.city_id,
      cityName: resultNewLocation.city_name,
    };
  } catch (error: any) {
    await client.query("ROLLBACK");

    if (error instanceof AppError) {
      throw error;
    }

    if (error?.severity === "ERROR") {
      throw new AppError(
        400,
        error.code ?? "DATABASE_ERROR",
        error.detail ?? error.message ?? "Database error"
      );
    }

    throw error;
  } finally {
    client.release();
  }
}
