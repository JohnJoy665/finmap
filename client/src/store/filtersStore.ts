import { create } from "zustand";
import type { FilterItem, GroupFilterValue } from "../shared/types/group.types";

type filtersStore = {
  groupsFilter: FilterItem[] | null;
  setGroupsFilter: (payload: FilterItem[]) => void;
  setSelectedGroupFilter: (filterType: GroupFilterValue) => void;
  selectedGroupFilter: GroupFilterValue | null;
};

export const useFiltersStore = create<filtersStore>((set) => ({
  groupsFilter: null,
  selectedGroupFilter: null,

  setGroupsFilter: (value) => {
    set((state) => ({
      ...state,
      groupsFilter: value,
    }));
  },

  setSelectedGroupFilter: (filterType) => {
    set((state) => ({
      ...state,
      groupsFilter: state.groupsFilter.map((filter) => ({
        ...filter,
        isActive: filter.value === filterType,
      })),
      selectedGroupFilter: filterType,
    }));
  },
}));
