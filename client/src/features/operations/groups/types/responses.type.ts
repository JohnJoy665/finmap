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
  filters: {
    value: GroupFilterValue;
    label: string;
    amount: string | null;
    isActive: boolean;
    daysInPeriod: number | null;

    dateFromLocal: string | null;
    dateToLocal: string | null;

    dateFromUTC: string | null;
    dateToUTC: string | null;

    timezone: string;
  }[];

  availableRange: {
    minDateLocal: string | null;
    maxDateLocal: string | null;
  };
};
