import { useEffect, useState } from "react";

import { useFiltersStore } from "../../../../../store/filtersStore";
import { useProfileStore } from "../../../../../store/profileStore";
import GroupWidjetListItems, {
  type GroupWidgetDisplayItem,
} from "../groupWidjetListItems/GroupWidjetListItems";

import PreviewWidget from "../../../previewWidget/components/PreviewWidget";
import { useOperationsStore } from "../../../../../store/operationsStore";
import useIsMobile from "../../../../../hooks/useIsMobile";
import {
  getGroupStatisticsWidget,
  type GroupStatisticsWidgetResponse,
} from "../../api/getGroupStatisticsWidget";

type GroupWidgetProps = {
  reloadOnAccountChange?: boolean;
};

function GroupWidget({ reloadOnAccountChange = true }: GroupWidgetProps) {
  const { isMobile } = useIsMobile();
  const [widgetData, setWidgetData] =
    useState<GroupStatisticsWidgetResponse | null>(null);

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

    async function getWidjet() {
      try {
        setIsLoading(true);

        const response = await getGroupStatisticsWidget({
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

    getWidjet();

    return () => {
      isCancelled = true;
    };
  }, [
    dateFromUTC,
    dateToUTC,
    accountReloadKey,
    accountReloadKey,
    operationsRevision,
  ]);

  if (!widgetData) return null;

  const groups: GroupWidgetDisplayItem[] = widgetData.groups;

  return (
    <PreviewWidget<GroupWidgetDisplayItem>
      isMobile={isMobile}
      title={widgetData.title}
      subTitles={widgetData.subTitles}
      isLoading={isLoading}
      items={groups}
      previewLimit={4}
      renderList={(items) => <GroupWidjetListItems groups={items} />}
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
            title: "Остальные группы",
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

export default GroupWidget;
