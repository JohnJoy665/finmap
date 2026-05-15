export type CreateNewGroupWithSpendingRequest = {
  groupName: string;
  categoryId: number;
  amount: string;
  conversionFactor: number;
  currencyCode: string;
  accountId: string;
};

export type CreateNewGroupWithSpendingResponseData = {
  groupId: string;
  groupName: string;
  spendingId: string;
  accountAmount: number;
};

export type GetCategoriesResponseData = {
  id: number;
  code: string;
  translation: string;
};

export type SpendingsFormGroup = {
  groupName?: string;
  groupId?: string;
};

export type SpendingsFormCategory = {
  categoryName?: string;
  categoryId?: string;
};

export type SpendingFormValues = {
  amount: string;
  category: number;
  groupName: string;
};
