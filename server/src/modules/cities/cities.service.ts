import { pool } from "../../db/pool";
import { AppError } from "../../utils/AppError";

type GetCitiesRequest = {
  langCode: string;
  countryCode: string;
  searchString: string;
};

type CityRow = {
  city_id: number;
  sity_name: string;
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
        CASE
          WHEN $3 = 'en' THEN c.international_name
          ELSE c.local_name
        END AS sity_name
      FROM cities c
      WHERE TRIM(c.country_code) = $1
        AND (
          c.local_name ILIKE $2
          OR c.international_name ILIKE $2
        )
      ORDER BY
        CASE
          WHEN c.local_name ILIKE $4 THEN 0
          WHEN c.international_name ILIKE $4 THEN 0
          ELSE 1
        END,
        sity_name ASC
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
      cityName: city.sity_name,
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
