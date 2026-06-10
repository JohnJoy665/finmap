import type { GroupFilterValue } from "../../../../shared/types/group.types";

export type ResponseChangedAccount = {
  accountId: string;
  amount: string;
};

export type deleteGroupWithSpendingResponse = {
  groupId: string;
  groupName: string;
  accounts: ResponseChangedAccount[];
};

export type GetGroupsFiltersResponse = {
  value: GroupFilterValue;
  label: string;
  amount?: string;
  isActive: boolean;
  daysInPeriod: number;
  dateFrom: string;
  dateTo: string;
};
