import { useEffect, useState } from "react";

import { useFiltersStore } from "../../../../../store/filtersStore";
import { useProfileStore } from "../../../../../store/profileStore";
import StatsWidget from "../../../statsWidget/StatsWidget";
import CategoryWidjetListItem from "../categoryWidjetListItem/CategoryWidjetListItem";
import CategoryWidjetPanel from "../categoryWidjetPanel/CategoryWidjetPanel";
import {
  getCategoryStatisticsWidget,
  type CategoryStatisticsWidgetResponse,
} from "../../api/getCategoryStatisticsWidget";

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

  const hasData = Boolean(widgetData?.categories?.length);

  return widgetData ? (
    <StatsWidget
      widgetKey="category-widget"
      disabled={!hasData}
      mainPanel={
        <CategoryWidjetPanel
          title={widgetData.title}
          subTitles={widgetData.subTitles}
          isLoading={isLoading}
        />
      }
      listItems={
        <CategoryWidjetListItem
          categories={widgetData.categories}
          isLoading={isLoading}
        />
      }
    />
  ) : null;
}

export default CategoryWidget;
