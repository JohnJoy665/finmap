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

  const selectedGroupFilter = useFiltersStore(
    (store) => store.selectedGroupFilter
  );

  const groupsFilter = useFiltersStore((store) => store.groupsFilter);

  useEffect(() => {
    if (!groupsFilter || !selectedGroupFilter || !account) return;

    const currentFilter = groupsFilter.find(
      (filter) => filter.value === selectedGroupFilter
    );

    if (!currentFilter) return;

    const { dateFromUTC, dateToUTC } = currentFilter;

    let isCancelled = false;

    async function getWidjet() {
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

    getWidjet();

    return () => {
      isCancelled = true;
    };
  }, [groupsFilter, selectedGroupFilter, account?.amount]);

  const hasData = Boolean(widgetData?.categories?.length);

  return widgetData ? (
    <StatsWidget
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
