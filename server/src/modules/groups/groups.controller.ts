import { Request, Response, NextFunction } from "express";
import {
  createGroup,
  deleteGroupWithSpendings,
  getGroups,
  getGroupsFilters,
} from "./groups.service";
import { sendSuccess } from "../../utils/apiResponse";
import {
  createGroupSchema,
  getGroupSchema,
  getGroupsFiltersQuerySchema,
} from "./groups.schemas";
import { AppError } from "../../utils/AppError";

export async function createGroupController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { error, value } = createGroupSchema.validate(req.body);

    if (error) {
      throw new AppError(400, "VALIDATION_ERROR", error.message);
    }

    const userId = req.user?.userId;
    const userSettings = req.userSettings;

    if (!userId || !userSettings) {
      throw new AppError(401, "UNAUTHORIZED", "Unauthorized");
    }

    const createdGroup = await createGroup({
      userId,
      userSettings,
      reqValues: value,
    });
    return sendSuccess(res, createdGroup, "Группа создана");
  } catch (error) {
    next(error);
  }
}

export async function getGroupsController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const userSettings = req.userSettings;

    const { error, value } = getGroupSchema.validate(req.query);

    if (error) {
      throw new AppError(400, "VALIDATION_ERROR", error.message);
    }

    if (!userId || !userSettings) {
      throw new AppError(401, "UNAUTHORIZED", "Unauthorized");
    }

    const groups = await getGroups({
      userId,
      userSettings,
      dateFromUTC: value.dateFromUTC,
      dateToUTC: value.dateToUTC,
    });
    return sendSuccess(res, groups);
  } catch (error) {
    next(error);
  }
}

export async function deleteGroupController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userId = req.user!.userId;
    const deleteGroupId = req.params!.groupId;
    const userSettings = req.userSettings;

    if (!userId || !userSettings) {
      throw new AppError(401, "UNAUTHORIZED", "Unauthorized");
    }

    if (!deleteGroupId || Array.isArray(deleteGroupId)) {
      throw new AppError(400, "GROUP_ID_REQUIRED", "Group id is required");
    }

    const deletedGroup = await deleteGroupWithSpendings({
      userId,
      deleteGroupId,
    });

    return sendSuccess(
      res,
      deletedGroup,
      `Граппа ${deletedGroup.groupName} удалена`
    );
  } catch (error) {
    next(error);
  }
}

export async function getGroupsFiltersController(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { error, value } = getGroupsFiltersQuerySchema.validate(req.query);

    if (error) {
      throw new AppError(400, "VALIDATION_ERROR", error.message);
    }

    const userId = req.user?.userId;
    const userSettings = req.userSettings;

    if (!userId || !userSettings) {
      throw new AppError(401, "UNAUTHORIZED", "Unauthorized");
    }

    const filters = await getGroupsFilters({
      userId,
      userSettings,
      groupFilterPeriod: value.groupFilterPeriod ?? null,
    });

    return sendSuccess(res, filters);
  } catch (error) {
    next(error);
  }
}
