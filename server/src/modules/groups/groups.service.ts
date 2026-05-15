import { pool } from "../../db/pool";
import { UserSettings } from "../../types/middlewares/userSettings.types";
import { AppError } from "../../utils/AppError";
import { changeAccountAmount } from "../accounts/accounts.service";

type CreateGroupValues = {
  groupName: string;
  amount: string;
  categoryId: number;
};

type CreateGroupRequest = {
  userId: string;
  userSettings: UserSettings;
  reqValues: CreateGroupValues;
};

type SpendingGroupRow = {
  id: string;
  name: string;
};

type SpendingRow = {
  id: string;
};

export async function createGroup({
  userId,
  userSettings,
  reqValues,
}: CreateGroupRequest) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const factoredAmount =
      BigInt(reqValues.amount) * BigInt(userSettings.conversionFactor);
    const normalisedGroupName = reqValues.groupName.trim().toLowerCase();
    const oldGroup = await client.query<SpendingGroupRow>(
      "select sg.id, sg.name from spendings_group sg where trim(lower(sg.name)) = $1 and sg.user_id = $2;",
      [normalisedGroupName, userId]
    );

    let groupForSpending: SpendingGroupRow;
    if (oldGroup.rows.length > 0) {
      groupForSpending = oldGroup.rows[0];
    } else {
      const newGroupId = await client.query<SpendingGroupRow>(
        "\
        insert into spendings_group (name, category_id, user_id)\
        values ( $1, $2, $3 ) RETURNING id, name;",
        [reqValues.groupName, reqValues.categoryId, userId]
      );
      groupForSpending = newGroupId.rows[0];
    }

    if (!groupForSpending) {
      throw new AppError(500, "GROUP_CREATE_FAILED", "Group was not created");
    }

    const product_name = "ВРЕМЕННО БЕЗ НАЗВАНИЯ";

    const spendingResult = await client.query<SpendingRow>(
      "insert into spendings (amount, user_id, currency_code, group_id, name, account_id, category_id)\
        values ( $1, $2, $3, $4, $5, $6, $7 ) RETURNING id;",
      [
        factoredAmount.toString(),
        userId,
        userSettings.currencyCode,
        groupForSpending.id,
        product_name,
        userSettings.accountId,
        reqValues.categoryId,
      ]
    );

    const changedAccount = await changeAccountAmount(client, {
      accountId: userSettings.accountId,
      userId,
      deltaAmount: -factoredAmount,
    });

    await client.query("COMMIT");

    return {
      groupId: groupForSpending.id,
      groupName: groupForSpending.name,
      spendingId: spendingResult.rows[0].id,
      accountAmount:
        Number(changedAccount.amount) / Number(userSettings.conversionFactor),
    };
  } catch (error: any) {
    await client.query("ROLLBACK");

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
  } finally {
    client.release();
  }
}

export async function getGroups(userId: string) {
  try {
    const result = await pool.query(
      `
      SELECT
        sg.id,
        sg.name AS title,
        cat.code AS category_icon,
        clg.translation AS category_description,
        sg.category_id,
        COALESCE(SUM(s.amount), 0) AS amount
      FROM spendings_group sg
      JOIN user_settings us
        ON us.user_id = sg.user_id
      JOIN category cat
        ON cat.id = sg.category_id
      JOIN category_lang clg
        ON clg.word_code = cat.code
      AND clg.lang_code = us.language_code
      LEFT JOIN spendings s
        ON s.group_id = sg.id
      AND s.account_id = us.account_id
      WHERE sg.user_id = $1
      GROUP BY
        sg.id,
        sg.name,
        sg.category_id,
        cat.code,
        clg.translation
      ORDER BY sg.last_change_date DESC;
      `,
      [userId]
    );

    return result.rows;
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
