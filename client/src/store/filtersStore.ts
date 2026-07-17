import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type {
  CustomGroupFilter,
  FilterItem,
  GroupFilterValue,
} from "../shared/types/group.types";

type FiltersStore = {
  groupsFilter: FilterItem[] | null;
  selectedGroupFilter: GroupFilterValue | null;
  customGroupFilter: CustomGroupFilter | null;

  setGroupsFilter: (payload: FilterItem[] | null) => void;
  setSelectedGroupFilter: (filterType: GroupFilterValue) => void;
  reset: () => void;
  clearGroupsFilter: () => void;
  setCustomGroupFilter: (filter: CustomGroupFilter | null) => void;
};

const initialState = {
  groupsFilter: null,
  selectedGroupFilter: null,
  customGroupFilter: null,
};

export const useFiltersStore = create<FiltersStore>()(
  devtools(
    (set) => ({
      ...initialState,

      clearGroupsFilter: () => {
        set(
          {
            groupsFilter: [],
          },
          false,
          "filters/clearGroupsFilter"
        );
      },

      setGroupsFilter: (value) => {
        set(
          {
            groupsFilter: value,
          },
          false,
          "filters/setGroupsFilter"
        );
      },

      setSelectedGroupFilter: (filterType) => {
        set(
          (state) => ({
            selectedGroupFilter: filterType,

            groupsFilter: state.groupsFilter
              ? state.groupsFilter.map((filter) => ({
                  ...filter,
                  isActive: filter.value === filterType,
                }))
              : state.groupsFilter,
          }),
          false,
          "filters/setSelectedGroupFilter"
        );
      },

      setCustomGroupFilter: (value) => {
        set(
          {
            customGroupFilter: value,
          },
          false,
          "filters/setCustomGroupFilter"
        );
      },

      reset: () => {
        set(initialState, false, "filters/reset");
      },
    }),
    {
      name: "FiltersStore",
      enabled: import.meta.env.DEV,
    }
  )
);
