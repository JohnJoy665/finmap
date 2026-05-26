import { pool } from "../../db/pool";
import { AppError } from "../../utils/AppError";

export type GetCountriesRequest = {
  searchString: string;
  langCode: string;
};

export type GetCountriesResponse = {
  countryName: string;
  countryCode?: string;
  countryId?: number;
};

type CountryRow = {
  country_name: string;
  country_code: string;
  country_id: number;
};

export async function getCountries({
  searchString,
  langCode,
}: GetCountriesRequest): Promise<GetCountriesResponse[]> {
  try {
    const searchPattern = `%${searchString.trim()}%`;

    const result = await pool.query<CountryRow>(
      `
      SELECT
        cl.translation AS country_name,
        TRIM(c.code) AS country_code,
        c.id AS country_id
      FROM countries_lang cl
      INNER JOIN countries c
        ON TRIM(c.code) = TRIM(cl.word_code)
      WHERE cl.lang_code = $1
        AND cl.translation ILIKE $2
      ORDER BY cl.translation ASC;
      `,
      [langCode, searchPattern]
    );

    return result.rows.map((row) => ({
      countryName: row.country_name,
      countryCode: row.country_code,
      countryId: row.country_id,
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
