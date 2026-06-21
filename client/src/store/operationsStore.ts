import { create } from "zustand";

type OperationsStore = {
  operationsRevision: number;
  refreshOperations: () => void;
  reset: () => void;
};

const initialState = {
  operationsRevision: 0,
};

export const useOperationsStore = create<OperationsStore>((set) => ({
  ...initialState,

  refreshOperations: () => {
    set((state) => ({
      operationsRevision: state.operationsRevision + 1,
    }));
  },

  reset: () => {
    set(initialState);
  },
}));
