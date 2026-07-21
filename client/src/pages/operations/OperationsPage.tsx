import { useEffect, useRef, useState } from "react";
import GroupGrid from "../../features/operations/groups/components/groupGrid/GroupGrid";
import SearchGroup from "../../features/operations/groups/components/searchGroup/SearchGroup";
import { getGroupsRequest } from "../../features/operations/groups/api/getGroups";
import { useGroupStore } from "../../store/groupStore";
import { useProfileStore } from "../../store/profileStore";
import FilterGroupContainer from "../../features/operations/groups/components/filterGroupContainer/FilterGroupContainer";
import { getGroupsFilters } from "../../features/operations/groups/api/getGroupsFilters";
import type {
  CustomGroupFilter,
  GroupFilterValue,
} from "../../shared/types/group.types";
import { useFiltersStore } from "../../store/filtersStore";
import useIsMobile from "../../hooks/useIsMobile";
import CommonDashboards from "../../features/dashboards/components/commonDashboards/CommonDashboards";
import CategoryWidget from "../../shared/widgets/categoryWidjet/components/categoryWidget/CategoryWidget";
import GroupWidget from "../../shared/widgets/groupWidget/components/groupWidget/GroupWidget";
import CategoryAverageWidget from "../../shared/widgets/categoryAverageWidget/components/categoryAverageWidget/CategoryAverageWidget";
import GroupAverageWidget from "../../shared/widgets/groupAverageWidget/components/groupAverageWidget/GroupAverageWidget";

type AvailableRange = {
  minDateLocal: string | null;
  maxDateLocal: string | null;
};

const initialAvailableRange: AvailableRange = {
  minDateLocal: null,
  maxDateLocal: null,
};

function Operations() {
  const { isMobile } = useIsMobile();

  const requestIdRef = useRef(0);

  const setGroups = useGroupStore((store) => store.setGroups);
  const setSearchString = useGroupStore((store) => store.setSearchString);

  const groupsFilter = useFiltersStore((store) => store.groupsFilter);
  const setGroupsFilter = useFiltersStore((store) => store.setGroupsFilter);
  const clearGroupsFilter = useFiltersStore((store) => store.clearGroupsFilter);

  const selectedGroupFilter = useFiltersStore(
    (store) => store.selectedGroupFilter
  );

  const setSelectedGroupFilter = useFiltersStore(
    (store) => store.setSelectedGroupFilter
  );

  const customGroupFilter = useFiltersStore((store) => store.customGroupFilter);

  const setCustomGroupFilter = useFiltersStore(
    (store) => store.setCustomGroupFilter
  );

  const conversionFactor = useProfileStore(
    (store) => store.account?.conversionFactor
  );

  const currencyCode = useProfileStore((store) => store.account?.currencyCode);

  const [availableRange, setAvailableRange] = useState<AvailableRange>(
    initialAvailableRange
  );

  const selectedGroupFilterRef = useRef<GroupFilterValue | null>(
    selectedGroupFilter
  );

  const customGroupFilterRef = useRef<CustomGroupFilter | null>(
    customGroupFilter
  );

  useEffect(() => {
    return () => {
      setSearchString("");
    };
  }, [setSearchString]);

  useEffect(() => {
    selectedGroupFilterRef.current = selectedGroupFilter;
  }, [selectedGroupFilter]);

  useEffect(() => {
    customGroupFilterRef.current = customGroupFilter;
  }, [customGroupFilter]);

  useEffect(() => {
    let isCancelled = false;

    async function initPage() {
      const requestId = ++requestIdRef.current;

      try {
        const savedSelectedFilter = selectedGroupFilterRef.current;
        const savedCustomFilter = customGroupFilterRef.current;

        const canRestoreCustom =
          savedSelectedFilter === "custom" && savedCustomFilter !== null;

        const filtersResponse = await getGroupsFilters({
          groupFilterPeriod:
            savedSelectedFilter === "custom" && !canRestoreCustom
              ? null
              : savedSelectedFilter,

          dateFromUTC: canRestoreCustom
            ? savedCustomFilter.dateFromUTC
            : undefined,

          dateToUTC: canRestoreCustom ? savedCustomFilter.dateToUTC : undefined,
        });

        if (isCancelled || requestId !== requestIdRef.current) {
          return;
        }

        const freshFilters = filtersResponse.data.filters;

        setGroupsFilter(freshFilters);
        setAvailableRange(filtersResponse.data.availableRange);

        const activeFilter =
          freshFilters.find((filter) => filter.isActive) ?? null;

        if (
          !activeFilter ||
          !activeFilter.dateFromUTC ||
          !activeFilter.dateToUTC
        ) {
          setGroups([]);
          return;
        }

        setSelectedGroupFilter(activeFilter.value);

        const groupsResponse = await getGroupsRequest({
          dateFromUTC: activeFilter.dateFromUTC,
          dateToUTC: activeFilter.dateToUTC,
        });

        if (isCancelled || requestId !== requestIdRef.current) {
          return;
        }

        setGroups(groupsResponse.data);
      } catch (error) {
        if (!isCancelled) {
          console.error(error);
        }
      }
    }

    initPage();

    return () => {
      isCancelled = true;
      requestIdRef.current += 1;

      clearGroupsFilter();
    };
  }, [
    currencyCode,
    clearGroupsFilter,
    setGroupsFilter,
    setSelectedGroupFilter,
    setGroups,
  ]);

  async function changeFilter(targetValue: GroupFilterValue) {
    if (!groupsFilter || targetValue === "custom") {
      return;
    }

    const currentFilter = groupsFilter.find((filter) => filter.isActive);

    if (currentFilter?.value === targetValue) {
      return;
    }

    const targetFilter = groupsFilter.find(
      (filter) => filter.value === targetValue
    );

    if (!targetFilter || !targetFilter.dateFromUTC || !targetFilter.dateToUTC) {
      return;
    }

    const requestId = ++requestIdRef.current;

    try {
      setSelectedGroupFilter(targetValue);
      setGroups([]);

      const groupsResponse = await getGroupsRequest({
        dateFromUTC: targetFilter.dateFromUTC,
        dateToUTC: targetFilter.dateToUTC,
      });

      if (requestId !== requestIdRef.current) {
        return;
      }

      setGroups(groupsResponse.data);
    } catch (error) {
      console.error(error);
    }
  }

  async function changeCustomFilter(period: CustomGroupFilter) {
    const requestId = ++requestIdRef.current;

    try {
      setGroups([]);

      const filtersResponse = await getGroupsFilters({
        groupFilterPeriod: "custom",
        dateFromUTC: period.dateFromUTC,
        dateToUTC: period.dateToUTC,
      });

      if (requestId !== requestIdRef.current) {
        return;
      }

      const freshFilters = filtersResponse.data.filters;

      const activeCustomFilter =
        freshFilters.find(
          (filter) => filter.value === "custom" && filter.isActive
        ) ?? null;

      if (
        !activeCustomFilter ||
        !activeCustomFilter.dateFromUTC ||
        !activeCustomFilter.dateToUTC
      ) {
        setGroups([]);
        return;
      }

      setCustomGroupFilter(period);
      setGroupsFilter(freshFilters);
      setAvailableRange(filtersResponse.data.availableRange);
      setSelectedGroupFilter("custom");

      const groupsResponse = await getGroupsRequest({
        dateFromUTC: activeCustomFilter.dateFromUTC,
        dateToUTC: activeCustomFilter.dateToUTC,
      });

      if (requestId !== requestIdRef.current) {
        return;
      }

      setGroups(groupsResponse.data);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <>
      <SearchGroup />

      {groupsFilter && conversionFactor && groupsFilter.length > 0 && (
        <FilterGroupContainer
          filters={groupsFilter}
          onChange={changeFilter}
          conversionFactor={conversionFactor}
          customGroupFilter={customGroupFilter}
          onCustomApply={changeCustomFilter}
          minDateLocal={availableRange.minDateLocal}
          maxDateLocal={availableRange.maxDateLocal}
        />
      )}

      <GroupGrid />

      {isMobile && (
        <CommonDashboards>
          <CategoryWidget reloadOnAccountChange={false} />
          <GroupWidget reloadOnAccountChange={false} />
          <CategoryAverageWidget reloadOnAccountChange={false} />
          <GroupAverageWidget reloadOnAccountChange={false} />
        </CommonDashboards>
      )}
    </>
  );
}

export default Operations;
