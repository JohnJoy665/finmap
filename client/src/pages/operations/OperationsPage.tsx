import { useEffect, useRef } from "react";
import GroupGrid from "../../features/operations/groups/components/groupGrid/GroupGrid";
import SearchGroup from "../../features/operations/groups/components/searchGroup/SearchGroup";
import { getGroupsRequest } from "../../features/operations/groups/api/getGroups";
import { useGroupStrore } from "../../store/groupStore";
import { useProfileStore } from "../../store/profileStore";
import FilterGroupContainer from "../../features/operations/groups/components/filterGroupContainer/FilterGroupContainer";
import { getGroupsFilters } from "../../features/operations/groups/api/getGroupsFilters";
import type { GroupFilterValue } from "../../shared/types/group.types";
import { useFiltersStore } from "../../store/filtersStore";
import useIsMobile from "../../hooks/useIsMobile";
import CommonDashboards from "../../features/dashboards/components/commonDashboards/CommonDashboards";
import CategoryWidget from "../../shared/widgets/categoryWidjet/components/categoryWidget/CategoryWidget";
import GroupWidget from "../../shared/widgets/groupWidget/components/groupWidget/GroupWidget";

function Operations() {
  const { isMobile } = useIsMobile();

  const requestIdRef = useRef(0);

  const setGroups = useGroupStrore((store) => store.setGroups);

  const groupsFilter = useFiltersStore((store) => store.groupsFilter);
  const setGroupsFilter = useFiltersStore((store) => store.setGroupsFilter);
  const clearGroupsFilter = useFiltersStore((store) => store.clearGroupsFilter);

  const selectedGroupFilter = useFiltersStore(
    (store) => store.selectedGroupFilter
  );

  const setSelectedGroupFilter = useFiltersStore(
    (store) => store.setSelectedGroupFilter
  );

  const conversionFactor = useProfileStore(
    (store) => store.account?.conversionFactor
  );

  const currencyCode = useProfileStore((store) => store.account?.currencyCode);

  const selectedGroupFilterRef = useRef<GroupFilterValue | null>(
    selectedGroupFilter
  );

  useEffect(() => {
    selectedGroupFilterRef.current = selectedGroupFilter;
  }, [selectedGroupFilter]);

  useEffect(() => {
    let isCancelled = false;

    async function initPage() {
      const requestId = ++requestIdRef.current;

      try {
        const selectedValue = selectedGroupFilterRef.current ?? null;
        // clearGroupsFilter();
        // setGroups([]);

        const filtersResponse = await getGroupsFilters({
          groupFilterPeriod: selectedValue,
        });

        if (isCancelled || requestId !== requestIdRef.current) return;

        const freshFilters = filtersResponse.data;

        setGroupsFilter(freshFilters);

        const activeFilter =
          freshFilters.find((filter) => filter.isActive) || null;

        if (!activeFilter) {
          setGroups([]);
          return;
        }

        setSelectedGroupFilter(activeFilter.value);

        const groupsResponse = await getGroupsRequest({
          dateFromUTC: activeFilter.dateFromUTC,
          dateToUTC: activeFilter.dateToUTC,
        });

        if (isCancelled || requestId !== requestIdRef.current) return;

        setGroups(groupsResponse.data);
      } catch (error) {
        console.log(error);
      }
    }

    initPage();

    return () => {
      isCancelled = true;
    };
  }, [
    currencyCode,
    clearGroupsFilter,
    setGroupsFilter,
    setSelectedGroupFilter,
    setGroups,
  ]);

  async function changeFilter(targetValue: GroupFilterValue) {
    if (!groupsFilter) return;

    const currentFilter = groupsFilter.find((filter) => filter.isActive);

    if (currentFilter?.value === targetValue) return;

    const targetFilter = groupsFilter.find(
      (filter) => filter.value === targetValue
    );

    if (!targetFilter) return;

    const requestId = ++requestIdRef.current;

    try {
      setSelectedGroupFilter(targetValue);
      setGroups([]);

      const groupsResponse = await getGroupsRequest({
        dateFromUTC: targetFilter.dateFromUTC,
        dateToUTC: targetFilter.dateToUTC,
      });

      if (requestId !== requestIdRef.current) return;

      setGroups(groupsResponse.data);
    } catch (error) {
      console.log(error);
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
        />
      )}

      <GroupGrid />

      {isMobile && (
        <CommonDashboards>
          <CategoryWidget reloadOnAccountChange={false} />
          <GroupWidget reloadOnAccountChange={false} />
        </CommonDashboards>
      )}
    </>
  );
}

export default Operations;
