import { create } from "zustand";
import type { User } from "../types/user.type";

type Account = {
  id: string;
  currencyCode: string;
  amount: string;
  currencySymbol: string;
  conversionFactor: number;
};

type Settings = {
  id: string;
  accountId: string | null;
  languageCode: string | null;
  countryCode: string | null;
  cityId: number | null;
  visibleAccount: boolean;
  visibleUserName: boolean;
  visibleGroupSpendings: boolean;
  visibleAverageGroupBill: boolean;
  currencyCode: string | null;
  currencySymbol: string | null;
  conversionFactor: number | null;
};

type ProfilePayload = {
  user: User;
  account: Account | null;
  settings: Settings | null;
  setupRequired: boolean | null;
};

type ProfileState = {
  user: User | null;
  account: Account | null;
  settings: Settings | null;
  setProfile: (payload: ProfilePayload) => void;
  updateAccountAmount: (amount: string) => void;
  setupRequired: boolean | null;
  clearProfile: () => void;
};

export const useProfileStore = create<ProfileState>((set) => ({
  user: null,
  account: null,
  settings: null,
  setupRequired: null,

  setProfile: ({ user, account, settings, setupRequired }) => {
    set((state) => ({ ...state, user, account, settings, setupRequired }));
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

  clearProfile: () => {
    set((state) => ({
      ...state,
      user: null,
      account: null,
      settings: null,
      setupRequired: null,
    }));
  },
}));
