import { create } from "zustand";
import type { Group } from "../shared/types/group.types";

type RenameGroupPayload = Pick<Group, "id" | "title">;

type GroupStore = {
  groups: Group[];
  setGroups: (groups: Group[]) => void;
  reset: () => void;
  searchString: string;
  setSearchString: (searchStr: string) => void;
  renameGroup: (group: RenameGroupPayload) => void;
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

  renameGroup: ({ id, title }) => {
    set((state) => {
      const foundGroup = state.groups.find((group) => group.id === id);

      console.log("Переименовываем:", { id, title });
      console.log("Группа в store:", foundGroup);
      console.log("Все группы:", state.groups);

      return {
        groups: state.groups.map((group) =>
          group.id === id ? { ...group, title } : group
        ),
      };
    });
  },
}));
