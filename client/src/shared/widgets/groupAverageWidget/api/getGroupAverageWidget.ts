import { request } from "../../../api/request";
import type { ApiSuccess } from "../../../api/types";

type GetGroupAverageWidgetParams = {
  dateFromUTC: string;
  dateToUTC: string;
  dateFromLocal: string;
  dateToLocal: string;
};

export type GroupAverageWidgetSubTitle = {
  subTitle: string;
  value: string | number;
};

export type GroupAverageWidgetItem = {
  id: string;
  title: string;
  countPurchase: number;
  averageAmountMinor: string;
  medianAmountMinor: string;
  currencyCode: string;
  conversionFactor: number;
  type: string;
};

export type GroupAverageWidgetResponse = {
  title: string;
  subTitles: GroupAverageWidgetSubTitle[];
  categories: GroupAverageWidgetItem[];
};

export async function getGroupAverageWidget({
  dateFromUTC,
  dateToUTC,
  dateFromLocal,
  dateToLocal,
}: GetGroupAverageWidgetParams): Promise<
  ApiSuccess<GroupAverageWidgetResponse>
> {
  return request<GroupAverageWidgetResponse>({
    method: "GET",
    url: "/widjets/Group-average",
    params: {
      dateFromUTC,
      dateToUTC,
      dateFromLocal,
      dateToLocal,
    },
  });
}
