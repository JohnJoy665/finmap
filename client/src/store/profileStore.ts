import { create } from "zustand";
import type { User } from "../types/user.type";
import type { Account } from "../shared/types/account.types";

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
  lastCheckPosition: string | null;
  timezone: string | null;
};

type ProfilePayload = {
  user: User | null;
  account: Account | null;
  settings: Settings | null;
  setupRequired: boolean | null;
};

type Location = {
  countryCode: string;
  cityId: number;
};

type UpdateAccountNamePayload = {
  accountId: string;
  name: string;
};

type ProfileState = {
  user: User | null;
  account: Account | null;
  settings: Settings | null;
  setProfile: (payload: ProfilePayload) => void;
  updateProfileAmount: (amount: string) => void;
  setupRequired: boolean | null;
  clearProfile: () => void;
  changeProfileAccount: (payload: Account) => void;
  updateLocation: (payload: Location) => void;
  updateProfileAccountName: (payload: UpdateAccountNamePayload) => void;
  reset: () => void;
};

const initialState = {
  user: null,
  account: null,
  settings: null,
  setupRequired: null,
};

export const useProfileStore = create<ProfileState>((set) => ({
  ...initialState,

  updateProfileAccountName: ({ accountId, name }) => {
    set((state) => {
      if (!state.account || state.account.id !== accountId) {
        return state;
      }

      return {
        ...state,
        account: {
          ...state.account,
          name,
        },
      };
    });
  },

  setProfile: ({ user, account, settings, setupRequired }) => {
    set((state) => ({ ...state, user, account, settings, setupRequired }));
  },

  updateProfileAmount: (amount) => {
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

  changeProfileAccount: (newAccount) => {
    set((state) => ({
      ...state,
      account: state.account?.id !== newAccount.id ? newAccount : state.account,

      settings: state.settings
        ? {
            ...state.settings,
            accountId: newAccount.id,
          }
        : state.settings,
    }));
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

  updateLocation: (location) => {
    set((state) => {
      if (!state.settings) {
        return state;
      }

      return {
        settings: {
          ...state.settings,
          countryCode: location.countryCode,
          cityId: location.cityId,
        },
      };
    });
  },

  reset: () => {
    set(initialState);
  },
}));
