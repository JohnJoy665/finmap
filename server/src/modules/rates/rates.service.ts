import { PoolClient } from "pg";
import { AppError } from "../../utils/AppError";
import { UserSettings } from "../../types/middlewares/userSettings.types";

type BaseAmountUserSettings = {
  currencyCode: string;
  conversionFactor: number;
};

type ExchangeRateRow = {
  exchange_rate: string | null;
};

export async function getBaseAmountMicro(
  client: PoolClient,
  minorAmountOriginal: string,
  userSettings: BaseAmountUserSettings
): Promise<bigint | null> {
  const CURRENCY_CODE_BASE = "USD";
  let exchangeRate: number;
  let baseAmountMicro: bigint | null = null;

  try {
    if (userSettings.currencyCode !== CURRENCY_CODE_BASE) {
      const exchangeRateResult = await client.query<ExchangeRateRow>(
        `
        SELECT er.exchange_rate
        FROM exchange_rates er
        WHERE er.base_currency = $1
          AND er.target_currency = $2
          AND er.date_rate <= NOW() 
          --AND er.date_rate >= NOW() - INTERVAL '24 hours'
        ORDER BY er.date_rate DESC
        LIMIT 1;
        `,
        [CURRENCY_CODE_BASE, userSettings.currencyCode]
      );

      const rateValue = exchangeRateResult.rows[0]?.exchange_rate;
      if (rateValue == null) return null;

      const exchangeRateNumber = Number(rateValue);

      if (!Number.isFinite(exchangeRateNumber) || exchangeRateNumber <= 0) {
        throw new AppError(400, "INCORRECT_RATE_VALUE", "Incorrect rate value");
      }

      exchangeRate = exchangeRateNumber;
    } else {
      exchangeRate = 1;
    }

    baseAmountMicro = BigInt(
      Math.round(
        (Number(minorAmountOriginal) /
          userSettings.conversionFactor /
          Number(exchangeRate)) *
          1_000_000
      )
    );

    return baseAmountMicro;
  } catch (err) {
    console.error("[getBaseAmountMicro]", err);

    if (err instanceof AppError) {
      throw err;
    }

    throw new AppError(
      400,
      "FAILED_GETTTING_BASE_AMOUNT",
      "Failed getting base amount"
    );
  }
}
