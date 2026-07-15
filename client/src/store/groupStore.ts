import { create } from "zustand";
import type { Group } from "../shared/types/group.types";

type GroupStore = {
  groups: Group[];
  setGroups: (groups: Group[]) => void;
  reset: () => void;
  searchString: string;
  setSearchString: (searchStr: string) => void;
};

const initialState = {
  groups: [],
  searchString: "",
};

export const useGroupStore = create<GroupStore>((set) => ({
  ...initialState,

  setGroups: (groups) => {
    set({ groups });
  },

  reset: () => {
    set(initialState);
  },

  setSearchString: (searchStr) => {
    set({ searchString: searchStr });
  },
}));
