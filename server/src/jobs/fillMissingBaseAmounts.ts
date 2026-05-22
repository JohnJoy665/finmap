import { pool } from "../db/pool";

async function main() {
  console.log("[fillMissingBaseAmounts] started");

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const usdSpendings = await client.query(`
      UPDATE spendings s
      SET base_amount_micro = ROUND(
        (s.amount::numeric / cur.conversion_factor) * 1000000
      )::bigint
      FROM currencies cur
      WHERE s.base_amount_micro IS NULL
        AND TRIM(s.currency_code) = 'USD'
        AND TRIM(cur.code) = 'USD';
    `);

    const nonUsdSpendings = await client.query(`
      WITH spendings_with_rates AS (
        SELECT
          s.id AS spending_id,
          s.amount,
          cur.conversion_factor,
          rate.exchange_rate
        FROM spendings s
        JOIN currencies cur
          ON TRIM(cur.code) = TRIM(s.currency_code)
        JOIN LATERAL (
          SELECT er.exchange_rate
          FROM exchange_rates er
          WHERE er.base_currency = 'USD'
            AND er.target_currency = TRIM(s.currency_code)
            AND er.date_rate <= s.spending_date
          ORDER BY er.date_rate DESC
          LIMIT 1
        ) rate ON true
        WHERE s.base_amount_micro IS NULL
          AND TRIM(s.currency_code) <> 'USD'
      )
      UPDATE spendings s
      SET base_amount_micro = ROUND(
        ((swr.amount::numeric / swr.conversion_factor) / swr.exchange_rate) * 1000000
      )::bigint
      FROM spendings_with_rates swr
      WHERE s.id = swr.spending_id;
    `);

    const usdIncomes = await client.query(`
      UPDATE incomes i
      SET base_amount_micro = ROUND(
        (i.amount::numeric / cur.conversion_factor) * 1000000
      )::bigint
      FROM currencies cur
      WHERE i.base_amount_micro IS NULL
        AND TRIM(i.currency_code) = 'USD'
        AND TRIM(cur.code) = 'USD';
    `);

    const nonUsdIncomes = await client.query(`
      WITH incomes_with_rates AS (
        SELECT
          i.id AS income_id,
          i.amount,
          cur.conversion_factor,
          rate.exchange_rate
        FROM incomes i
        JOIN currencies cur
          ON TRIM(cur.code) = TRIM(i.currency_code)
        JOIN LATERAL (
          SELECT er.exchange_rate
          FROM exchange_rates er
          WHERE er.base_currency = 'USD'
            AND er.target_currency = TRIM(i.currency_code)
            AND er.date_rate <= i.date
          ORDER BY er.date_rate DESC
          LIMIT 1
        ) rate ON true
        WHERE i.base_amount_micro IS NULL
          AND TRIM(i.currency_code) <> 'USD'
      )
      UPDATE incomes i
      SET base_amount_micro = ROUND(
        ((iwr.amount::numeric / iwr.conversion_factor) / iwr.exchange_rate) * 1000000
      )::bigint
      FROM incomes_with_rates iwr
      WHERE i.id = iwr.income_id;
    `);

    await client.query("COMMIT");

    console.log("[fillMissingBaseAmounts] updated:", {
      usdSpendings: usdSpendings.rowCount,
      nonUsdSpendings: nonUsdSpendings.rowCount,
      usdIncomes: usdIncomes.rowCount,
      nonUsdIncomes: nonUsdIncomes.rowCount,
      total:
        Number(usdSpendings.rowCount) +
        Number(nonUsdSpendings.rowCount) +
        Number(usdIncomes.rowCount) +
        Number(nonUsdIncomes.rowCount),
    });

    console.log("[fillMissingBaseAmounts] finished successfully");
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("[fillMissingBaseAmounts] failed", error);

    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
