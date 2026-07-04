import { create } from "zustand";
import type { Account } from "../shared/types/account.types";

type ChangedAccount = {
  accountId: string;
  amount: string;
};

type changeNameParams = {
  accountId: string;
  name: string;
};

type AccountStore = {
  accounts: Account[];
  setAccounts: (account: Account[]) => void;
  updateListAmountAccounts: (payload: ChangedAccount[]) => void;
  addToListAmountAccounts: (payload: Account) => void;
  updateNameAccount: (payload: changeNameParams) => void;
  reset: () => void;
};

const initialState = {
  accounts: [],
};

export const useAccountsStore = create<AccountStore>((set) => ({
  ...initialState,

  setAccounts: (accounts) => {
    set({ accounts });
  },

  updateNameAccount: (payload) => {
    set((state) => ({
      accounts: state.accounts.map((account) => {
        if (account.id !== payload.accountId) return account;

        return {
          ...account,
          name: payload.name,
        };
      }),
    }));
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

  reset: () => {
    set(initialState);
  },
}));
