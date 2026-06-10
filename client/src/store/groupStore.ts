import { create } from "zustand";
import type { Group } from "../shared/types/group.types";

type GroupStore = {
  groups: Group[];
  setGroups: (groups: Group[]) => void;
  reset: () => void;
};

const initialState = {
  groups: [],
};

export const useGroupStrore = create<GroupStore>((set) => ({
  ...initialState,

  setGroups: (groups) => {
    set({ groups });
  },

  reset: () => {
    set(initialState);
  },
}));
