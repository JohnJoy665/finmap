export type CreateNewGroupWithSpendingRequest = {
  groupName: string;
  amount: string;
  categoryId: number | undefined;
};

export type CreateNewSpendingRequest = {
  amount: string;
  groupId: string;
  categoryId: number | undefined;
};
