import { pool } from "../../db/pool";
import { AppError } from "../../utils/AppError";

type GetCitiesRequest = {
  langCode: string;
  countryCode: string;
  searchString: string;
};

type CityRow = {
  city_id: number;
  city_name: string;
};

export type GetCitiesResponse = {
  cityId: number;
  cityName: string;
};

export async function getCities({
  langCode,
  countryCode,
  searchString,
}: GetCitiesRequest): Promise<GetCitiesResponse[]> {
  try {
    const normalizedSearchString = searchString.trim();
    const normalizedSearch = `%${normalizedSearchString}%`;
    const normalizedPrefixSearch = `${normalizedSearchString}%`;

    const normalizedLangCode = langCode.trim().toLowerCase();
    const normalizedCountryCode = countryCode.trim().toUpperCase();

    const result = await pool.query<CityRow>(
      `
      SELECT
        c.id AS city_id,
        COALESCE(cl_name.translation, c.local_name, c.international_name) AS city_name
      FROM cities c
    
      LEFT JOIN LATERAL (
        SELECT cl.translation
        FROM cities_lang cl
        WHERE cl.city_id = c.id
          AND cl.lang_code = $3
          AND cl.is_historic = false
        ORDER BY
          CASE
            WHEN cl.translation ILIKE $4 THEN 0
            WHEN cl.translation ILIKE $2 THEN 1
            ELSE 2
          END,
          cl.is_preferred DESC,
          cl.is_short ASC,
          cl.translation ASC
        LIMIT 1
      ) cl_name ON true
    
      WHERE TRIM(c.country_code) = $1
        AND (
          EXISTS (
            SELECT 1
            FROM cities_lang cl_search
            WHERE cl_search.city_id = c.id
              AND cl_search.lang_code = $3
              AND cl_search.is_historic = false
              AND cl_search.translation ILIKE $2
          )
          OR c.local_name ILIKE $2
          OR c.international_name ILIKE $2
        )
    
      ORDER BY
        CASE
          WHEN cl_name.translation ILIKE $4 THEN 0
          WHEN c.local_name ILIKE $4 THEN 0
          WHEN c.international_name ILIKE $4 THEN 0
          ELSE 1
        END,
        city_name ASC
    
      LIMIT 50;
      `,
      [
        normalizedCountryCode,
        normalizedSearch,
        normalizedLangCode,
        normalizedPrefixSearch,
      ]
    );

    return result.rows.map((city) => ({
      cityId: city.city_id,
      cityName: city.city_name,
    }));
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
