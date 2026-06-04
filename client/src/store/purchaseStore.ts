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
};

export const usePurchaseStore = create<PurchaseStore>((set) => ({
  categories: [],
  setCategories: (categories) => {
    set({ categories });
  },
}));
