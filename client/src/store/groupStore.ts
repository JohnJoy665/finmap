import { create } from "zustand";
import type { Group } from "../shared/types/group.types";

type GroupStore = {
  groups: Group[];
  setGroups: (groups: Group[]) => void;
};

export const useGroupStrore = create<GroupStore>((set) => ({
  groups: [],

  setGroups: (groups) => {
    set({ groups });
  },
}));
