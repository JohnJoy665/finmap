import { pool } from "../../db/pool";
import { AppError } from "../../utils/AppError";

import type { UserSettings } from "../../types/middlewares/userSettings.types";

export async function getCategory(userSettings: UserSettings) {
  const result = await pool.query(
    `
      SELECT 
        c.id,
        c.code,
        clg.translation
      FROM category c
      INNER JOIN category_lang clg 
        ON clg.word_code = c.code
      WHERE clg.lang_code = $1
      ORDER BY clg.translation ASC;
    `,
    [userSettings.languageCode]
  );

  if (result.rows.length === 0) {
    throw new AppError(404, "CATEGORIES_NOT_FOUND", "categories not found");
  }

  return result.rows.map((row) => ({
    id: row.id,
    code: row.code,
    translation: row.translation,
  }));
}
