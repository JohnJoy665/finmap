import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Group } from "../shared/types/group.types";

type RenameGroupPayload = Pick<Group, "id" | "title">;

type GroupStore = {
  groups: Group[];
  searchString: string;

  setGroups: (groups: Group[]) => void;
  setSearchString: (searchStr: string) => void;
  renameGroup: (group: RenameGroupPayload) => void;
  reset: () => void;
};

const initialState = {
  groups: [] as Group[],
  searchString: "",
};

export const useGroupStore = create<GroupStore>()(
  devtools(
    (set) => ({
      ...initialState,

      setGroups: (groups) => {
        set({ groups }, false, "groups/setGroups");
      },

      setSearchString: (searchString) => {
        set({ searchString }, false, "groups/setSearchString");
      },

      renameGroup: ({ id, title }) => {
        set(
          (state) => ({
            groups: state.groups.map((group) =>
              group.id === id ? { ...group, title } : group
            ),
          }),
          false,
          "groups/renameGroup"
        );
      },

      reset: () => {
        set(initialState, false, "groups/reset");
      },
    }),
    {
      name: "GroupStore",
    }
  )
);
