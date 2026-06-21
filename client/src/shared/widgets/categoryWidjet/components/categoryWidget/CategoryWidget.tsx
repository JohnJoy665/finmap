import { useEffect, useState } from "react";

import { useFiltersStore } from "../../../../../store/filtersStore";
import { useProfileStore } from "../../../../../store/profileStore";
import { useOperationsStore } from "../../../../../store/operationsStore";

import {
  getCategoryStatisticsWidget,
  type CategoryStatisticsWidgetResponse,
} from "../../api/getCategoryStatisticsWidget";

import PreviewWidget from "../previewWidget/PreviewWidget";
import CategoryWidjetListItem, {
  type CategoryWidgetDisplayItem,
} from "../categoryWidjetListItem/CategoryWidjetListItem";
import useIsMobile from "../../../../../hooks/useIsMobile";

type CategoryWidgetProps = {
  reloadOnAccountChange?: boolean;
};

function CategoryWidget({ reloadOnAccountChange = true }: CategoryWidgetProps) {
  const { isMobile } = useIsMobile();
  const [widgetData, setWidgetData] =
    useState<CategoryStatisticsWidgetResponse | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const operationsRevision = useOperationsStore(
    (state) => state.operationsRevision
  );

  const accountId = useProfileStore((state) => state.account?.id ?? null);
  const groupsFilter = useFiltersStore((state) => state.groupsFilter);

  const activeFilter = groupsFilter?.find((filter) => filter.isActive) ?? null;

  const dateFromUTC = activeFilter?.dateFromUTC ?? null;
  const dateToUTC = activeFilter?.dateToUTC ?? null;

  const accountReloadKey = reloadOnAccountChange ? accountId : "Ignore-case";

  useEffect(() => {
    if (!dateFromUTC || !dateToUTC) return;

    if (reloadOnAccountChange && !accountId) return;

    let isCancelled = false;

    async function getWidget() {
      try {
        setIsLoading(true);

        const response = await getCategoryStatisticsWidget({
          dateFromUTC,
          dateToUTC,
        });

        if (isCancelled) return;

        setWidgetData(response.data);
      } catch (error) {
        if (isCancelled) return;

        console.error(error);
        setWidgetData(null);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    getWidget();

    return () => {
      isCancelled = true;
    };
  }, [
    dateFromUTC,
    dateToUTC,
    reloadOnAccountChange,
    operationsRevision,
    accountReloadKey,
  ]);

  if (!widgetData) return null;

  const categories: CategoryWidgetDisplayItem[] = widgetData.categories;

  return (
    <PreviewWidget<CategoryWidgetDisplayItem>
      isMobile={isMobile}
      title={widgetData.title}
      subTitles={widgetData.subTitles}
      isLoading={isLoading}
      items={categories}
      previewLimit={4}
      renderList={(items) => <CategoryWidjetListItem categories={items} />}
      getPreviewItems={({ items, visibleItems, hiddenItems }) => {
        if (hiddenItems.length === 0) {
          return visibleItems;
        }

        const otherPercent = hiddenItems.reduce(
          (sum, item) => sum + Number(item.percent || 0),
          0
        );

        const otherAmount = hiddenItems
          .reduce((sum, item) => {
            if (item.amount === null) return sum;

            return sum + Number(item.amount);
          }, 0)
          .toString();

        const firstCategory = items[0];

        return [
          ...visibleItems,
          {
            id: "OTHER",
            title: "Остальные категории",
            amount: otherAmount,
            percent: Number(otherPercent.toFixed(1)),
            currencyCode: firstCategory?.currencyCode ?? "",
            conversionFactor: firstCategory?.conversionFactor ?? 100,
            isOther: true,
          },
        ];
      }}
    />
  );
}

export default CategoryWidget;
