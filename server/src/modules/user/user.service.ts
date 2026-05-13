import { pool } from "../../db/pool";
import { AppError } from "../../utils/AppError";

export async function meService(userId: string) {
  const result = await pool.query(
    `
        SELECT id, name, email
        FROM users
        WHERE id = $1
      `,
    [userId]
  );

  const user = result.rows[0];

  if (!user) {
    throw new AppError(
      401,
      "AUTH_USER_NOT_FOUND",
      "Authenticated user not found"
    );
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}
