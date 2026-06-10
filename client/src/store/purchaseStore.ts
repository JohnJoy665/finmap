import { create } from "zustand";

import type { CategoryCode } from "../types/category.type";

type Category = {
  id: number;
  code: CategoryCode;
  translation: string;
};

type PurchaseStore = {
  categories: Category[];
  setCategories: (categories: Category[]) => void;
  reset: () => void;
};

const initialState = {
  categories: [],
};

export const usePurchaseStore = create<PurchaseStore>((set) => ({
  ...initialState,

  setCategories: (categories) => {
    set({ categories });
  },

  reset: () => {
    set(initialState);
  },
}));
