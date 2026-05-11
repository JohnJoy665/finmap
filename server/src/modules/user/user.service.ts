import { pool } from "../../db/pool";


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
        throw new Error("User not found");
      }
  
  
    return {
        id: user.id,
        name: user.name,
        email: user.email,
    };
  }