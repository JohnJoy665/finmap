import { create } from "zustand";

type AuthState = {
  isAuth: boolean;
  login: () => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuth: false,

  login: () => {
    set({ isAuth: true });
  },

  logout: () => {
    set({ isAuth: false });
  },
}));