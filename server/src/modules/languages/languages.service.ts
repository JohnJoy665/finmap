import { pool } from "../../db/pool";
import { AppError } from "../../utils/AppError";

type getLanguagesRow = {
  id: number;
  code: string;
  name_original: string;
};

export async function getLanguages() {
  try {
    const languages = await pool.query<getLanguagesRow>(
      ` 
      SELECT 
      ls.id,
      ls.code,
      ls.name_original
      FROM languages ls
      ORDER BY ls.name_original
      `
    );

    return languages.rows.map((language) => ({
      id: language.id,
      code: language.code,
      nameOriginal: language.name_original,
    }));
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
