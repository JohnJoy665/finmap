type UUID = string;

import type { CategoryCode } from "../../types/category.type";

export type Group = {
  id: UUID;
  title: string;
  category_icon: CategoryCode;
  category_description: string;
  category_id: string;
  amount: string | null;
  is_converted: boolean;
};

export type GroupFilterValue = "today" | "week" | "month" | "year" | "custom";

export type CustomGroupFilter = {
  dateFromUTC: string;
  dateToUTC: string;
};

export type FilterItem = {
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
};
