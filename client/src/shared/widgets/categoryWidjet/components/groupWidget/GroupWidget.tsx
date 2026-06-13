import { useEffect, useState } from "react";

import { useFiltersStore } from "../../../../../store/filtersStore";
import { useProfileStore } from "../../../../../store/profileStore";
import StatsWidget from "../../../statsWidget/StatsWidget";
import CategoryWidjetPanel from "../categoryWidjetPanel/CategoryWidjetPanel";
import GroupWidjetListItems from "../groupWidjetListItems/GroupWidjetListItems";
import {
  getGroupStatisticsWidget,
  type GroupStatisticsWidgetResponse,
} from "../../api/getGroupStatisticsWidget";

function GroupWidget() {
  const [widgetData, setWidgetData] =
    useState<GroupStatisticsWidgetResponse | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const accountAmount = useProfileStore((store) => store.account?.amount);

  const groupsFilter = useFiltersStore((store) => store.groupsFilter);

  useEffect(() => {
    if (!groupsFilter || accountAmount === undefined) return;

    let isCancelled = false;

    const currentFilter = groupsFilter.find((filter) => filter.isActive);

    async function getWidjet() {
      try {
        if (!currentFilter) return;
        setIsLoading(true);

        const response = await getGroupStatisticsWidget({
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
  }, [groupsFilter, accountAmount]);

  const hasData = Boolean(widgetData?.groups?.length);

  return widgetData ? (
    <StatsWidget
      widgetKey="group-widget"
      disabled={!hasData}
      mainPanel={
        <CategoryWidjetPanel
          title={widgetData.title}
          subTitles={widgetData.subTitles}
          isLoading={isLoading}
        />
      }
      listItems={
        <GroupWidjetListItems
          groups={widgetData.groups}
          isLoading={isLoading}
        />
      }
    />
  ) : null;
}

export default GroupWidget;
