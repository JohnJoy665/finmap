import { pool } from "../../db/pool";
import { AppError } from "../../utils/AppError";

type CheckProfileEnvironmentRequest = {
  userId: string;
  userSettings: {
    timezone: string | null;
    cityId: number | null;
    languageCode: string | null;
    lastCheckPosition: string | null;
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

const LOCATION_CHECK_INTERVAL_HOURS = 24;
const LOCATION_CHANGE_DISTANCE_METERS = 100_000;

export async function checkProfileEnvironment({
  userId,
  userSettings,
  reqValues,
}: CheckProfileEnvironmentRequest) {
  const { timezone, latitude, longitude } = reqValues;

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const timezoneUpdated = timezone !== userSettings.timezone;

    if (timezoneUpdated) {
      await client.query(
        `
          UPDATE user_settings
          SET timezone = $1
          WHERE user_id = $2
        `,
        [timezone, userId]
      );
    }

    const shouldCheckPosition =
      !userSettings.lastCheckPosition ||
      Date.now() - new Date(userSettings.lastCheckPosition).getTime() >
        LOCATION_CHECK_INTERVAL_HOURS * 60 * 60 * 1000;

    await client.query(
      `
      UPDATE user_settings
      SET last_check_position = now()
      WHERE user_id = $1
          `,
      [userId]
    );

    if (!shouldCheckPosition || latitude === null || longitude === null) {
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
          SELECT ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography AS location
        ),
        current_city AS (
          SELECT c.location
          FROM cities c
          WHERE c.id = $3
        ),
        distance_check AS (
          SELECT
            ST_Distance(cc.location, up.location) AS distance_meters
          FROM current_city cc
          CROSS JOIN user_point up
        )
        SELECT
          nearest_city.id AS city_id,
          COALESCE(cl.translation, nearest_city.international_name) AS city_name,
          nearest_city.country_code::text AS country_code,
          COALESCE(cnl.translation, countries.name) AS country_name,
          ST_Distance(nearest_city.location, up.location)::text AS distance_meters
        FROM user_point up
        CROSS JOIN distance_check dc
        JOIN LATERAL (
          SELECT
            c.id,
            c.country_code,
            c.international_name,
            c.location
          FROM cities c
          WHERE c.location IS NOT NULL
            AND c.feature_code IN ('PPLC', 'PPLA', 'PPLA2', 'PPLA3', 'PPLA4', 'PPL')
            AND COALESCE(c.population, 0) >= 100000
          ORDER BY c.location <-> up.location
          LIMIT 1
        ) nearest_city ON true
        JOIN countries ON countries.code = nearest_city.country_code
        LEFT JOIN cities_lang cl
          ON cl.city_id = nearest_city.id
          AND cl.lang_code = $4
        LEFT JOIN countries_lang cnl
          ON cnl.word_code = nearest_city.country_code::text
          AND cnl.lang_code = $4
        WHERE dc.distance_meters > $5
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

    const suggestedLocation = suggestedLocationResult.rows[0];

    await client.query("COMMIT");

    return {
      timezoneUpdated,
      positionChecked: true,
      locationChanged: Boolean(suggestedLocation),
      suggestedLocation: suggestedLocation
        ? {
            cityId: suggestedLocation.city_id,
            cityName: suggestedLocation.city_name,
            countryCode: suggestedLocation.country_code,
            countryName: suggestedLocation.country_name,
            distanceMeters: suggestedLocation.distance_meters,
          }
        : null,
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
