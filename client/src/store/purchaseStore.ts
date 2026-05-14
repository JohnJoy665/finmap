import { create } from "zustand";

type Category = {
  id: number;
  code: string;
  translation: string;
};

type PurchaseStore = {
  categories: Category[] | [];
  setCategories: (categories: Category[]) => void;
};

export const usePurchaseStore = create<PurchaseStore>((set) => ({
  categories: [],
  setCategories: (categories) => {
    set({ categories });
  },
}));
