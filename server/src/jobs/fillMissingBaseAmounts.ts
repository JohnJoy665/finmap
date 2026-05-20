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
      UPDATE spendings s
      SET base_amount_micro = ROUND(
        ((s.amount::numeric / cur.conversion_factor) / er.exchange_rate) * 1000000
      )::bigint
      FROM exchange_rates er, currencies cur
      WHERE s.base_amount_micro IS NULL
        AND TRIM(s.currency_code) <> 'USD'
        AND TRIM(cur.code) = TRIM(s.currency_code)
        AND er.base_currency = 'USD'
        AND er.target_currency = TRIM(s.currency_code)
        AND er.date_rate = s.spending_date::date;
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
      UPDATE incomes i
      SET base_amount_micro = ROUND(
        ((i.amount::numeric / cur.conversion_factor) / er.exchange_rate) * 1000000
      )::bigint
      FROM exchange_rates er, currencies cur
      WHERE i.base_amount_micro IS NULL
        AND TRIM(i.currency_code) <> 'USD'
        AND TRIM(cur.code) = TRIM(i.currency_code)
        AND er.base_currency = 'USD'
        AND er.target_currency = TRIM(i.currency_code)
        AND er.date_rate = i.date::date;
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
