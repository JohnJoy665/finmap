import { create } from "zustand";
import type { Account } from "../shared/types/account.types";

type AccountStore = {
  accounts: Account[];
  setAccounts: (account: Account[]) => void;
  updateListAmountAccounts: (accountId: string, amount: string) => void;
  addToListAmountAccounts: (payload: Account) => void;
};

export const useAccountsStore = create<AccountStore>((set) => ({
  accounts: [],

  setAccounts: (accounts) => {
    set({ accounts });
  },

  updateListAmountAccounts: (accountId, amount) => {
    set((state) => ({
      ...state,
      accounts: state.accounts.map((item) => ({
        ...item,
        amount: item.id === accountId ? amount : item.amount,
      })),
    }));
  },

  addToListAmountAccounts: (payload) => {
    set((state) => ({
      ...state,
      accounts: [...state.accounts, payload],
    }));
  },
}));
