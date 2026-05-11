import { create } from "zustand";
import type { User } from "../types/user.type";
import { persist } from "zustand/middleware";

type AuthState = {
  user: User | null;
  token: string | null;
  setAuth: (payload: { user: User; token: string }) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: ({ user, token }) => {
        set({ user, token });
      },
      logout: () => {
        set({ user: null, token: null });
      },
    }),
    { name: "auth-storage" }
  )
);
