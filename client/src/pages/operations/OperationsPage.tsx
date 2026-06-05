import { useEffect, useState } from "react";
import GroupGrid from "../../features/operations/groups/components/groupGrid/GroupGrid";
import SearchGroup from "../../features/operations/groups/components/searchGroup/SearchGroup";
import { getGroupsRequest } from "../../features/operations/groups/api/getGroups";
import { useGroupStrore } from "../../store/groupStore";
import { useProfileStore } from "../../store/profileStore";
import FilterGroupContainer from "../../features/operations/groups/components/filterGroupContainer/FilterGroupContainer";
import { getGroupsFilters } from "../../features/operations/groups/api/getGroupsFilters";

export type GroupFilterValue = "today" | "week" | "month" | "year";

type FilterItem = {
  value: GroupFilterValue;
  label: string;
  amount?: string;
  isActive: boolean;
};

function Operations() {
  const [filters, setFilters] = useState<FilterItem[] | null>(null);
  const setGroups = useGroupStrore((store) => store.setGroups);

  const activeAccountId = useProfileStore((store) => store.account?.id);

  const conversionFactor = useProfileStore(
    (store) => store.account?.conversionFactor
  );

  const selectedPeriodType = useGroupStrore(
    (store) => store.selectedPeriodType
  );

  const setSelectedPeriodType = useGroupStrore(
    (store) => store.setSelectedPeriodType
  );

  const currencyCode = useProfileStore((store) => store.account?.currencyCode);

  useEffect(() => {
    async function getFilters() {
      try {
        const filters = await getGroupsFilters();
        setFilters(filters.data);
      } catch (error) {
        console.log(error);
      }
    }
    getFilters();
  }, [currencyCode]);

  useEffect(() => {
    if (!activeAccountId || !filters) return;

    async function getGroups() {
      try {
        const groups = await getGroupsRequest({
          periodType: selectedPeriodType,
        });
        setGroups(groups.data);
      } catch (error) {
        console.log(error);
      }
    }

    getGroups();
  }, [setGroups, activeAccountId, filters]);

  function changeFilter(targetValue: GroupFilterValue) {
    setSelectedPeriodType(targetValue);
    setFilters((prev) =>
      prev
        ? prev.map((filter) => ({
            ...filter,
            isActive: filter.value === targetValue,
          }))
        : prev
    );
  }

  return (
    <>
      <SearchGroup />
      {filters && conversionFactor && filters.length > 0 && (
        <FilterGroupContainer
          filters={filters}
          onChange={changeFilter}
          conversionFactor={conversionFactor}
        />
      )}
      <GroupGrid />
    </>
  );
}

export default Operations;
