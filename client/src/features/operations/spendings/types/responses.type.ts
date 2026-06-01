import type { CategoryCode } from "../../../../types/category.type";

export type CreateNewGroupWithSpendingResponseData = {
  groupId: string;
  groupName: string;
  spendingId: string;
  accountAmount: string;
};

export type GetCategoriesResponseData = {
  id: number;
  code: CategoryCode;
  translation: string;
};

export type CreateNewSpendingResponseData = {
  spendingId: string;
  accountAmount: string;
};
