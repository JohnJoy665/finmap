import { request } from "../../../api/request";
import type { ApiSuccess } from "../../../api/types";

type GetCategoryAverageWidgetParams = {
  dateFromUTC: string;
  dateToUTC: string;
};

export type CategoryAverageWidgetSubTitle = {
  subTitle: string;
  value: string | number;
};

export type CategoryAverageWidgetItem = {
  id: string;
  title: string;
  countPurchase: number;
  averageAmountMinor: string;
  medianAmountMinor: string;
  currencyCode: string;
  conversionFactor: number;
};

export type CategoryAverageWidgetResponse = {
  title: string;
  subTitles: CategoryAverageWidgetSubTitle[];
  categories: CategoryAverageWidgetItem[];
};

export async function getCategoryAverageWidget({
  dateFromUTC,
  dateToUTC,
}: GetCategoryAverageWidgetParams): Promise<
  ApiSuccess<CategoryAverageWidgetResponse>
> {
  return request<CategoryAverageWidgetResponse>({
    method: "GET",
    url: "/widjets/category-average",
    params: {
      dateFromUTC,
      dateToUTC,
    },
  });
}
