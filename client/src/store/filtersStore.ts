import { create } from "zustand";
import type { FilterItem, GroupFilterValue } from "../shared/types/group.types";

type FiltersStore = {
  groupsFilter: FilterItem[] | null;
  selectedGroupFilter: GroupFilterValue | null;

  setGroupsFilter: (payload: FilterItem[] | null) => void;
  setSelectedGroupFilter: (filterType: GroupFilterValue) => void;
  reset: () => void;
  clearGroupsFilter: () => void;
};

const initialState = {
  groupsFilter: null,
  selectedGroupFilter: null,
};

export const useFiltersStore = create<FiltersStore>((set) => ({
  ...initialState,

  clearGroupsFilter: () => {
    set({
      groupsFilter: [],
    });
  },

  setGroupsFilter: (value) => {
    set({
      groupsFilter: value,
    });
  },

  setSelectedGroupFilter: (filterType) => {
    set((state) => ({
      selectedGroupFilter: filterType,

      groupsFilter: state.groupsFilter
        ? state.groupsFilter.map((filter) => ({
            ...filter,
            isActive: filter.value === filterType,
          }))
        : state.groupsFilter,
    }));
  },

  reset: () => {
    set(initialState);
  },
}));
