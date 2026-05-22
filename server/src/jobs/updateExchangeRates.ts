import { pool } from "../db/pool";

type ExchangeRateApiResponse = {
  result: "success" | "error";
  provider?: string;
  documentation?: string;
  terms_of_use?: string;
  time_last_update_unix?: number;
  time_last_update_utc?: string;
  time_next_update_unix?: number;
  time_next_update_utc?: string;
  time_eol_unix?: number;
  base_code?: string;
  rates?: Record<string, number>;
  "error-type"?: string;
};

const BASE_CURRENCY = "USD";
const EXCHANGE_RATE_API_URL = `https://open.er-api.com/v6/latest/${BASE_CURRENCY}`;

async function getTargetCurrencies(): Promise<string[]> {
  const result = await pool.query<{ code: string }>(
    `
      SELECT code
      FROM currencies
      WHERE code <> $1
      ORDER BY code ASC
    `,
    [BASE_CURRENCY]
  );

  return result.rows.map((row) => row.code);
}

async function fetchExchangeRates(): Promise<ExchangeRateApiResponse> {
  const response = await fetch(EXCHANGE_RATE_API_URL);

  if (!response.ok) {
    throw new Error(
      `ExchangeRate API request failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json() as Promise<ExchangeRateApiResponse>;
}

function getDateFromUnixTimestamp(unixTimestamp: number): string {
  return new Date(unixTimestamp * 1000).toISOString();
}

async function saveExchangeRates(params: {
  dateRate: string;
  baseCurrency: string;
  rates: Record<string, number>;
  targetCurrencies: string[];
}) {
  const { dateRate, baseCurrency, rates, targetCurrencies } = params;

  let savedCount = 0;
  const missingCurrencies: string[] = [];

  for (const currencyCode of targetCurrencies) {
    const rate = rates[currencyCode];

    if (rate === undefined) {
      missingCurrencies.push(currencyCode);
      continue;
    }

    await pool.query(
      `
        INSERT INTO exchange_rates (
          date_rate,
          base_currency,
          target_currency,
          exchange_rate
        )
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (date_rate, base_currency, target_currency)
        DO UPDATE SET exchange_rate = EXCLUDED.exchange_rate
      `,
      [dateRate, baseCurrency, currencyCode, rate]
    );

    savedCount += 1;
  }

  return {
    savedCount,
    missingCurrencies,
  };
}

async function updateExchangeRates() {
  console.log("Exchange rates update started");

  const targetCurrencies = await getTargetCurrencies();

  if (targetCurrencies.length === 0) {
    console.log("No target currencies found. Nothing to update.");
    return;
  }

  console.log(`Target currencies: ${targetCurrencies.join(", ")}`);

  const apiResponse = await fetchExchangeRates();

  if (apiResponse.result !== "success") {
    throw new Error(
      `ExchangeRate API returned error: ${apiResponse["error-type"]}`
    );
  }

  if (!apiResponse.base_code || !apiResponse.rates) {
    throw new Error("ExchangeRate API returned invalid response shape");
  }

  if (apiResponse.base_code !== BASE_CURRENCY) {
    throw new Error(
      `Unexpected base currency: ${apiResponse.base_code}. Expected: ${BASE_CURRENCY}`
    );
  }

  if (!apiResponse.time_last_update_unix) {
    throw new Error("ExchangeRate API response has no time_last_update_unix");
  }

  const dateRate = getDateFromUnixTimestamp(apiResponse.time_last_update_unix);

  const result = await saveExchangeRates({
    dateRate,
    baseCurrency: apiResponse.base_code,
    rates: apiResponse.rates,
    targetCurrencies,
  });

  console.log(`Exchange rates date: ${dateRate}`);
  console.log(`Saved rates: ${result.savedCount}`);

  if (result.missingCurrencies.length > 0) {
    console.warn(
      `Missing currencies in API response: ${result.missingCurrencies.join(
        ", "
      )}`
    );
  }

  console.log("Exchange rates update finished");
}

updateExchangeRates()
  .catch((error) => {
    console.error("Exchange rates update failed");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
