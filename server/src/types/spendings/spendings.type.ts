import { UserSettings } from "../middlewares/userSettings.types";

export type CreateSpendingValues = {
  amount: string;
  groupId: string;
  categoryId: number | undefined;
};

export type CreateSpendingRequest = {
  userId: string;
  userSettings: UserSettings;
  reqValues: CreateSpendingValues;
};
