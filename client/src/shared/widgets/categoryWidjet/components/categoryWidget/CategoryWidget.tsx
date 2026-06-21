import { useEffect, useState } from "react";

import { useFiltersStore } from "../../../../../store/filtersStore";
import { useProfileStore } from "../../../../../store/profileStore";
import {
  getCategoryStatisticsWidget,
  type CategoryStatisticsWidgetResponse,
} from "../../api/getCategoryStatisticsWidget";
import PreviewStatsWidget from "../previewStatsWidget/PreviewStatsWidget";

function CategoryWidget() {
  const [widgetData, setWidgetData] =
    useState<CategoryStatisticsWidgetResponse | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const account = useProfileStore((store) => store.account);

  const groupsFilter = useFiltersStore((store) => store.groupsFilter);

  useEffect(() => {
    if (!groupsFilter || !account) return;
    let isCancelled = false;

    const currentFilter = groupsFilter.find((filter) => filter.isActive);

    async function getWidjet() {
      try {
        setIsLoading(true);

        if (!currentFilter) return;

        const response = await getCategoryStatisticsWidget({
          dateFromUTC: currentFilter.dateFromUTC,
          dateToUTC: currentFilter.dateToUTC,
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
  }, [groupsFilter, account]);

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
