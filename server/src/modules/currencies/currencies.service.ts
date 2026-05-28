import { pool } from "../../db/pool";
import { AppError } from "../../utils/AppError";

type GetCurrenciesRequest = {
  langCode: string;
};

type CurrencyRow = {
  currencyName: string;
  currencyCode: string;
  currencySymbol: string;
  conversionFactor: number;
};

export type GetCurrenciesResponse = CurrencyRow[];

export async function getCurrencies({
  langCode,
}: GetCurrenciesRequest): Promise<GetCurrenciesResponse> {
  try {
    const result = await pool.query<CurrencyRow>(
      `
      SELECT
        cl.translation AS "currencyName",
        c.code AS "currencyCode",
        c.currency_symbol AS "currencySymbol",
        c.conversion_factor AS "conversionFactor"
      FROM currencies c
      INNER JOIN currencies_lang cl
        ON cl.word_code = c.code
       AND cl.lang_code = $1
      ORDER BY c.code ASC
      `,
      [langCode]
    );

    return result.rows;
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
