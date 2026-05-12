import { create } from "zustand";
import type { User } from "../types/user.type";
import { persist } from "zustand/middleware";

type AuthState = {
  user: User | null;
  token: string | null;
  isAuthChecked: boolean;

  setAuth: (payload: { user: User; token: string }) => void;
  setUser: (user: User) => void;
  setAuthChecked: (value: boolean) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthChecked: false,

      setAuth: ({ user, token }) => {
        set({ user, token });
      },
      setUser: (user) => {
        set({ user });
      },
      setAuthChecked: (value) => {
        set({ isAuthChecked: value });
      },
      logout: () => {
        set({ user: null, token: null, isAuthChecked: true });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
);
