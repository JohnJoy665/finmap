import type { CategoryCode } from "../../../../types/category.type";

export type CreateNewGroupWithSpendingRequest = {
  groupName: string;
  amount: string;
  categoryId: number | undefined;
};

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

export type SpendingsFormGroup = {
  groupName: string;
  groupId: string;
};

export type SpendingsFormCategory = {
  categoryName: string;
  categoryId: string;
};

export type SpendingFormValues = {
  amount: string;
  category?: number;
  groupName?: string;
};

export type CreateNewSpendingRequest = {
  amount: string;
  groupId: string;
  categoryId: number | undefined;
};

export type CreateNewSpendingResponseData = {
  spendingId: string;
  accountAmount: string;
};
