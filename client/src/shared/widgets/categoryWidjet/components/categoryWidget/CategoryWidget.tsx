import { useEffect, useState } from "react";

import { useFiltersStore } from "../../../../../store/filtersStore";
import { useProfileStore } from "../../../../../store/profileStore";
import {
  getCategoryStatisticsWidget,
  type CategoryStatisticsWidgetResponse,
} from "../../api/getCategoryStatisticsWidget";
import PreviewStatsWidget from "../previewStatsWidget/PreviewStatsWidget";
import { useOperationsStore } from "../../../../../store/operationsStore";

function CategoryWidget() {
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

  useEffect(() => {
    if (!dateFromUTC || !dateToUTC || !accountId) return;

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
  }, [dateFromUTC, dateToUTC, accountId, operationsRevision]);

  return widgetData ? (
    <PreviewStatsWidget
      title={widgetData.title}
      subTitles={widgetData.subTitles}
      isLoading={isLoading}
      categories={widgetData.categories}
      previewLimit={4}
    />
  ) : null;
}

export default CategoryWidget;
