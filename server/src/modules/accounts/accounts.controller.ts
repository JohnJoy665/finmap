import { NextFunction, Request, Response } from "express";
import { AppError } from "../../utils/AppError";
import { sendSuccess } from "../../utils/apiResponse";
import {
  changeCurrentAccount,
  correctAccountAmount,
  createAccount,
  getAccounts,
  updateAccountName,
} from "./accounts.service";
import {
  changeCurrentAccountSchema,
  correctAccountAmountSchema,
  createAcountSchema,
  updateAccountNameSchema,
} from "./accounts.schemas";

export async function getAccountsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(401, "UNAUTHORIZED", "Unauthorized");
    }

    const accounts = await getAccounts({ userId });

    sendSuccess(res, accounts);
  } catch (error) {
    next(error);
  }
}

export async function createAccountController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { error, value } = createAcountSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    const userId = req.user?.userId;
    const cityId = req.userSettings?.cityId;

    if (!userId || !cityId) {
      throw new AppError(401, "UNAUTHORIZED", "Unauthorized");
    }

    const newAccount = await createAccount({ userId, ...value, cityId });
    sendSuccess(res, newAccount);
  } catch (error) {
    next(error);
  }
}

export async function changeCurrentAccountController( //
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { error, value } = changeCurrentAccountSchema.validate(req.body);

    if (error) {
      throw new AppError(400, "VALIDATION_ERROR", error.message);
    }

    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(401, "UNAUTHORIZED", "Unauthorized");
    }

    const account = await changeCurrentAccount({
      userId,
      accountId: value.accountId,
    });

    sendSuccess(res, account);
  } catch (error) {
    next(error);
  }
}

export async function updateAccountNameController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { error, value } = updateAccountNameSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      throw new AppError(400, "VALIDATION_ERROR", error.message);
    }

    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError(401, "UNAUTHORIZED", "Unauthorized");
    }

    const data = await updateAccountName({
      userId,
      accountId: value.accountId,
      name: value.name,
    });

    sendSuccess(res, data);
  } catch (error) {
    next(error);
  }
}

export async function correctAccountAmountController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { error, value } = correctAccountAmountSchema.validate(req.body);

    if (error) {
      throw new AppError(400, "VALIDATION_ERROR", error.message);
    }

    const userId = req.user?.userId;
    const userSettings = req.userSettings;

    if (!userId || !userSettings) {
      throw new AppError(401, "UNAUTHORIZED", "Unauthorized");
    }

    const result = await correctAccountAmount({
      userId,
      userSettings: userSettings,
      accountId: value.accountId,
      amount: value.amount,
    });

    sendSuccess(res, result, "Account amount corrected successfully");
  } catch (error) {
    next(error);
  }
}
