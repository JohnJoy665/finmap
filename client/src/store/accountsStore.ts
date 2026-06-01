import { create } from "zustand";
import type { Account } from "../shared/types/account.types";

type ChangedAccount = {
  accountId: string;
  amount: string;
};

type AccountStore = {
  accounts: Account[];
  setAccounts: (account: Account[]) => void;
  updateListAmountAccounts: (payload: ChangedAccount[]) => void;
  addToListAmountAccounts: (payload: Account) => void;
};

export const useAccountsStore = create<AccountStore>((set) => ({
  accounts: [],

  setAccounts: (accounts) => {
    set({ accounts });
  },

  updateListAmountAccounts: (payload) => {
    set((state) => ({
      ...state,
      accounts: state.accounts.map((account) => {
        const changedAccount = payload.find(
          (item) => item.accountId === account.id
        );

        if (!changedAccount) return account;

        return {
          ...account,
          amount: changedAccount.amount,
        };
      }),
    }));
  },

  addToListAmountAccounts: (payload) => {
    set((state) => ({
      ...state,
      accounts: [...state.accounts, payload],
    }));
  },
}));
