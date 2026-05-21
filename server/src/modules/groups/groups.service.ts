import { PoolClient } from "pg";
import { pool } from "../../db/pool";
import { UserSettings } from "../../types/middlewares/userSettings.types";
import { AppError } from "../../utils/AppError";
import { changeAccountAmount } from "../accounts/accounts.service";
import { getBaseAmountMicro } from "../rates/rates.service";

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

type GetGroupResponse = {
  id: string;
  title: string;
  category_icon: string;
  category_description: string;
  category_id: number;
  amount: number;
};

export async function createGroup({
  userId,
  userSettings,
  reqValues,
}: CreateGroupRequest) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
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

    const baseAmountMicro = await getBaseAmountMicro(
      client,
      reqValues.amount,
      userSettings
    );

    const spendingResult = await client.query<SpendingRow>(
      "insert into spendings (amount, user_id, currency_code, group_id, name, account_id, category_id, base_amount_micro)\
        values ( $1, $2, $3, $4, $5, $6, $7, $8 ) RETURNING id;",
      [
        reqValues.amount,
        userId,
        userSettings.currencyCode,
        groupForSpending.id,
        product_name,
        userSettings.accountId,
        reqValues.categoryId,
        baseAmountMicro,
      ]
    );

    const changedAccount = await changeAccountAmount(client, {
      accountId: userSettings.accountId,
      userId,
      deltaAmount: -BigInt(reqValues.amount),
    });

    await client.query("COMMIT");

    return {
      groupId: groupForSpending.id,
      groupName: groupForSpending.name,
      spendingId: spendingResult.rows[0].id,
      accountAmount: changedAccount.amount,
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

type GetGroupsreq = {
  userId: string;
  userSettings: UserSettings;
};

export async function getGroups({ userId, userSettings }: GetGroupsreq) {
  try {
    const result = await pool.query<GetGroupResponse>(
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

type DeleteGroupWithSpendingsReq = {
  userId: string;
  deleteGroupId: string;
  userSettings: UserSettings;
};

type DeleteGroupWithSpendingsRes = {
  id: string;
  name: string;
};

export async function deleteGroupWithSpendings({
  userId,
  deleteGroupId,
  userSettings,
}: DeleteGroupWithSpendingsReq) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const deletedSpendings = await client.query(
      `
        WITH deleted_spendings AS (
          DELETE FROM spendings
          WHERE user_id = $1
            AND group_id = $2
          RETURNING amount
        )
        SELECT COALESCE(SUM(amount), 0) AS total_amount
        FROM deleted_spendings;
      `,
      [userId, deleteGroupId]
    );

    const totalAmount = BigInt(deletedSpendings.rows[0].total_amount);

    const changedAccount = await changeAccountAmount(client, {
      accountId: userSettings.accountId,
      userId,
      deltaAmount: totalAmount,
    });

    const deletedGroup = await client.query<DeleteGroupWithSpendingsRes>(
      `
        DELETE FROM spendings_group
        WHERE id = $1
          AND user_id = $2
        RETURNING id, name;
      `,
      [deleteGroupId, userId]
    );

    if (deletedGroup.rowCount === 0) {
      throw new AppError(404, "GROUP_NOT_FOUND", "Group not found");
    }

    await client.query("COMMIT");

    return {
      accountAmount: changedAccount.amount,
      groupId: deletedGroup.rows[0].id,
      groupName: deletedGroup.rows[0].name,
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
