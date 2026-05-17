import { create } from "zustand";
import type { User } from "../types/user.type";

type Account = {
  id: string;
  currencyCode: string;
  amount: string;
  currencySymbol: string;
  conversionFactor: number;
};

type ProfileState = {
  user: User | null;
  account: Account | null;
  setProfile: (payload: { user: User; account: Account }) => void;
  updateAccountAmount: (amount: string) => void;
};

export const useProfileStore = create<ProfileState>((set) => ({
  user: null,
  account: null,

  setProfile: ({ user, account }) => {
    set({ user, account });
  },

  updateAccountAmount: (amount) => {
    set((state) => {
      if (!state.account) {
        return state;
      }

      return {
        ...state,
        account: {
          ...state.account,
          amount,
        },
      };
    });
  },
}));
