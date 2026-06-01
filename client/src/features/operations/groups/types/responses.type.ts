export type ResponseChangedAccount = {
  accountId: string;
  amount: string;
};

export type deleteGroupWithSpendingResponse = {
  groupId: string;
  groupName: string;
  accounts: ResponseChangedAccount[];
};
