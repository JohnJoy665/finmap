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

export type GroupFilterValue = "today" | "week" | "month" | "year";

export type FilterItem = {
  value: GroupFilterValue;
  label: string;
  amount?: string;
  isActive: boolean;
  daysInPeriod: number;
  dateFrom: string;
  dateTo: string;
};
