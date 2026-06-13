import { useEffect } from "react";
import GroupGrid from "../../features/operations/groups/components/groupGrid/GroupGrid";
import SearchGroup from "../../features/operations/groups/components/searchGroup/SearchGroup";
import { getGroupsRequest } from "../../features/operations/groups/api/getGroups";
import { useGroupStrore } from "../../store/groupStore";
import { useProfileStore } from "../../store/profileStore";
import FilterGroupContainer from "../../features/operations/groups/components/filterGroupContainer/FilterGroupContainer";
import { getGroupsFilters } from "../../features/operations/groups/api/getGroupsFilters";
import type { GroupFilterValue } from "../../shared/types/group.types";
import { useFiltersStore } from "../../store/filtersStore";
// import CommonDashboards from "../../features/dashboards/components/commonDashboards/CommonDashboards";
// import StatsWidget from "../../shared/widgets/statsWidget/StatsWidget";
// import CategoryWidjetPanel from "../../shared/widgets/categoryWidjet/components/categoryWidjetPanel/CategoryWidjetPanel";
// import CategoryWidjetListItem from "../../shared/widgets/categoryWidjet/components/categoryWidjetListItem/CategoryWidjetListItem";

function Operations() {
  const setGroups = useGroupStrore((store) => store.setGroups);
  const conversionFactor = useProfileStore(
    (store) => store.account?.conversionFactor
  );
  const groupsFiltersReloadKey = useFiltersStore(
    (store) => store.groupsFiltersReloadKey
  );
  const groupsFilter = useFiltersStore((store) => store.groupsFilter);
  const setGroupsFilter = useFiltersStore((store) => store.setGroupsFilter);
  const setSelectedGroupFilter = useFiltersStore(
    (store) => store.setSelectedGroupFilter
  );
  const selectedGroupFilter = useFiltersStore(
    (store) => store.selectedGroupFilter
  );
  const currencyCode = useProfileStore((store) => store.account?.currencyCode);

  useEffect(() => {
    async function getFilters() {
      try {
        const currentSelectedGroupFilter =
          useFiltersStore.getState().selectedGroupFilter;

        const filters = await getGroupsFilters({
          groupFilterPeriod: currentSelectedGroupFilter,
        });

        setGroupsFilter(filters.data);

        const selectedFilterFromServer = filters.data.find(
          (filter) => filter.isActive
        )?.value;

        if (selectedFilterFromServer) {
          setSelectedGroupFilter(selectedFilterFromServer);
        }
      } catch (error) {
        console.log(error);
      }
    }

    getFilters();
  }, [
    groupsFiltersReloadKey,
    currencyCode,
    setGroupsFilter,
    setSelectedGroupFilter,
  ]);

  useEffect(() => {
    async function getGroups() {
      if (!groupsFilter || !selectedGroupFilter) return;
      try {
        const currentFilter = groupsFilter.find(
          (filter) => filter.value === selectedGroupFilter
        );

        if (!currentFilter) return;

        const groups = await getGroupsRequest({
          dateFromUTC: currentFilter.dateFromUTC,
          dateToUTC: currentFilter.dateToUTC,
        });
        setGroups(groups.data);
      } catch (error) {
        console.log(error);
      }
    }

    getGroups();
  }, [setGroups, selectedGroupFilter, groupsFilter]);

  function changeFilter(targetValue: GroupFilterValue) {
    if (selectedGroupFilter === targetValue) return;
    setSelectedGroupFilter(targetValue);
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
      {/* <CommonDashboards>
        <StatsWidget
          mainPanel={<CategoryWidjetPanel />}
          listItems={<CategoryWidjetListItem />}
        />
        <StatsWidget
          mainPanel={<CategoryWidjetPanel />}
          listItems={<CategoryWidjetListItem />}
        />
        <StatsWidget
          mainPanel={<CategoryWidjetPanel />}
          listItems={<CategoryWidjetListItem />}
        />
        <StatsWidget
          mainPanel={<CategoryWidjetPanel />}
          listItems={<CategoryWidjetListItem />}
        />
      </CommonDashboards> */}
    </>
  );
}

export default Operations;
