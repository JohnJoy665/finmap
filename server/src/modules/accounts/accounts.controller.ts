import { NextFunction, Request, Response } from "express";
import { AppError } from "../../utils/AppError";
import { sendSuccess } from "../../utils/apiResponse";
import {
  changeCurrentAccount,
  createAccount,
  getAccounts,
} from "./accounts.service";
import {
  changeCurrentAccountSchema,
  createAcountSchema,
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
