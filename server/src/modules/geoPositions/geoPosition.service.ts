import { pool } from "../../db/pool";
import { AppError } from "../../utils/AppError";

export type GetGeoPositionRequest = {
  latitude: number;
  longitude: number;
  langCode: string;
};

type GeoPositionRow = {
  city_id: number;
  country_code: string;
  city_local_name: string | null;
  city_international_name: string | null;
  feature_code: string;
  population: number | null;
  country_name: string;
  country_id: number;
};

export type GetGeoPositionResponse = {
  cityId: number;
  countryCode: string;
  cityLocalName: string | null;
  cityInternationalName: string | null;
  featureCode: string;
  population: number | null;
  countryName: string;
  countryId: number;
};

export async function getGeoPosition(
  params: GetGeoPositionRequest
): Promise<GetGeoPositionResponse> {
  try {
    const { latitude, longitude, langCode } = params;

    const result = await pool.query<GeoPositionRow>(
      `
      SELECT
        cs.id AS city_id,
        cs.country_code,
        cs.local_name AS city_local_name,
        cs.international_name AS city_international_name,
        cs.feature_code,
        cs.population,
        clg.translation AS country_name,
        cls.id AS country_id
      FROM cities cs
      INNER JOIN countries cls
        ON cls.code = cs.country_code
      INNER JOIN countries_lang clg
        ON clg.lang_code = $1
        AND clg.word_code = cs.country_code
      WHERE cs.location IS NOT NULL
        AND cs.feature_code IN ('PPLC', 'PPLA', 'PPLA2', 'PPLA3', 'PPLA4', 'PPL')
        AND cs.population >= 100000
      ORDER BY cs.location <-> ST_SetSRID(
        ST_MakePoint($2, $3),
        4326
      )::geography
      LIMIT 1;
      `,
      [langCode, longitude, latitude]
    );

    const row = result.rows[0];

    if (!row) {
      throw new AppError(404, "CITY_NOT_FOUND", "City not found");
    }

    return {
      cityId: row.city_id,
      countryCode: row.country_code,
      cityLocalName: row.city_local_name,
      cityInternationalName: row.city_international_name,
      featureCode: row.feature_code,
      population: row.population,
      countryName: row.country_name,
      countryId: row.country_id,
    };
  } catch (error: any) {
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
  }
}
