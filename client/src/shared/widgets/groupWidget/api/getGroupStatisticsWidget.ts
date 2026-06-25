import { request } from "../../../../shared/api/request";
import type { ApiSuccess } from "../../../../shared/api/types";

type GetGroupStatisticsWidgetParams = {
  dateFromUTC: string;
  dateToUTC: string;
};

export type GroupStatisticsWidgetSubTitle = {
  subTitle: string;
  value: string | number;
};

export type GroupStatisticsWidgetItem = {
  id: string;
  title: string;
  amount: string | null;
  percent: number;
  currencyCode: string;
  conversionFactor: number;
  type: string;
};

export type GroupStatisticsWidgetResponse = {
  title: string;
  subTitles: GroupStatisticsWidgetSubTitle[];
  groups: GroupStatisticsWidgetItem[];
};

export async function getGroupStatisticsWidget({
  dateFromUTC,
  dateToUTC,
}: GetGroupStatisticsWidgetParams): Promise<
  ApiSuccess<GroupStatisticsWidgetResponse>
> {
  return request<GroupStatisticsWidgetResponse>({
    method: "GET",
    url: "/widjets/group-statistics",
    params: {
      dateFromUTC,
      dateToUTC,
    },
  });
}
