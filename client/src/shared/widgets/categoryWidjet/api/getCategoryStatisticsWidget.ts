import { request } from "../../../../shared/api/request";
import type { ApiSuccess } from "../../../../shared/api/types";

type GetCategoryStatisticsWidgetParams = {
  dateFromUTC: string;
  dateToUTC: string;
  dateFromLocal: string;
  dateToLocal: string;
};

export type CategoryStatisticsWidgetSubTitle = {
  subTitle: string;
  value: string | number;
};

export type CategoryStatisticsWidgetItem = {
  id: string;
  title: string;
  amount: string;
  percent: number;
  currencyCode: string;
  conversionFactor: number;
  type: string;
};

export type CategoryStatisticsWidgetResponse = {
  title: string;
  subTitles: CategoryStatisticsWidgetSubTitle[];
  categories: CategoryStatisticsWidgetItem[];
};

export async function getCategoryStatisticsWidget({
  dateFromUTC,
  dateToUTC,
  dateFromLocal,
  dateToLocal,
}: GetCategoryStatisticsWidgetParams): Promise<
  ApiSuccess<CategoryStatisticsWidgetResponse>
> {
  return request<CategoryStatisticsWidgetResponse>({
    method: "GET",
    url: "/widjets/category-statistics",
    params: {
      dateFromUTC,
      dateToUTC,
      dateFromLocal,
      dateToLocal,
    },
  });
}
