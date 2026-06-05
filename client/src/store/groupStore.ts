import { create } from "zustand";
import type { Group } from "../shared/types/group.types";

type GroupFilterValue = "today" | "week" | "month" | "year";

type GroupStore = {
  groups: Group[];
  setGroups: (groups: Group[]) => void;
  selectedPeriodType: GroupFilterValue;
  setSelectedPeriodType: (value: GroupFilterValue) => void;
};

export const useGroupStrore = create<GroupStore>((set) => ({
  groups: [],

  setGroups: (groups) => {
    set({ groups });
  },

  selectedPeriodType: "week",

  setSelectedPeriodType: (value) =>
    set((state) => ({
      ...state,
      selectedPeriodType: value,
    })),
}));
