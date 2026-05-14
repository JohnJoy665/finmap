import { create } from "zustand";
import type { User } from "../types/user.type";

type Account = {
  id: string;
  currencyCode: string;
  amount: number;
  currencySymbol: string;
};

type ProfileState = {
  user: User | null;
  account: Account | null;
  setProfile: (payload: { user: User; account: Account }) => void;
  updateAccountAmount: (amount) => void;
};

export const useProfileStore = create<ProfileState>((set) => ({
  user: null,
  account: null,

  setProfile: ({ user, account }) => {
    set({ user, account });
  },

  updateAccountAmount: (amount) => {
    set((state) => ({
      ...state,
      account: {
        ...state.account,
        amount,
      },
    }));
  },
}));
