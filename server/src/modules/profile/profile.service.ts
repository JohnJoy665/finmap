import { pool } from "../../db/pool";
import { AppError } from "../../utils/AppError";

export async function getUserProfile(userId: string) {
  const result = await pool.query(
    `
    SELECT
    	uss.user_id, 
    	u."name", 
    	u.email,

    	uss.account_id,
      a.currency_code,
      a.amount,

      uss.conversion_factor,
      uss.currency_symbol

    FROM user_settings uss
      INNER JOIN users u ON u.id = uss.user_id
      INNER JOIN accounts a ON a.id = uss.account_id
      WHERE uss.user_id = $1
    LIMIT 1;
    `,
    [userId]
  );

  if (result.rows.length === 0) {
    throw new AppError(404, "ACCOUNT_NOT_FOUND", "Account not found");
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
