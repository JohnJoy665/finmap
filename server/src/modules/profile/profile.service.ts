import { pool } from "../../db/pool";

export async function getUserProfile(userId: string) {
  const result = await pool.query(
    `
    SELECT
      u.id AS user_id,
      u.name,
      u.email,

      a.id AS account_id,
      a.currency_code,
      a.amount,

      c.conversion_factor,
      c.currency_symbol
    FROM users u
    INNER JOIN accounts a ON a.user_id = u.id
    INNER JOIN currencies c ON c.code = a.currency_code
    WHERE u.id = $1
    LIMIT 1;
    `,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new Error("Account not found");
  }

  const row = result.rows[0];

  return {
    user: {
      id: row.user_id,
      name: row.name,
      email: row.email,
    },
    account: {
      id: row.account_id,
      currencyCode: row.currency_code,
      amount: Number(row.amount) / Number(row.conversion_factor),
      currencySymbol: row.currency_symbol,
    },
  };
}
