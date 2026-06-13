import { create } from "zustand";
import type { FilterItem, GroupFilterValue } from "../shared/types/group.types";

type filtersStore = {
  groupsFilter: FilterItem[] | null;
  setGroupsFilter: (payload: FilterItem[] | null) => void;
  setSelectedGroupFilter: (filterType: GroupFilterValue) => void;
  selectedGroupFilter: GroupFilterValue | null;
  reset: () => void;
  requestGroupsFiltersReload: () => void;
  groupsFiltersReloadKey: number;
};

const initialState = {
  groupsFilter: null,
  selectedGroupFilter: null,
  groupsFiltersReloadKey: 0,
};

export const useFiltersStore = create<filtersStore>((set) => ({
  ...initialState,

  requestGroupsFiltersReload: () => {
    set((state) => ({
      groupsFiltersReloadKey: state.groupsFiltersReloadKey + 1,
    }));
  },

  setGroupsFilter: (value) => {
    set((state) => ({
      ...state,
      groupsFilter: value,
    }));
  },

  setSelectedGroupFilter: (filterType) => {
    set((state) => {
      if (!state.groupsFilter) return state;

      return {
        ...state,
        groupsFilter: state.groupsFilter.map((filter) => ({
          ...filter,
          isActive: filter.value === filterType,
        })),
        selectedGroupFilter: filterType,
      };
    });
  },

  reset: () => {
    set(initialState);
  },
}));
