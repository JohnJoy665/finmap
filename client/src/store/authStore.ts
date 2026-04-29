import { create } from "zustand";
import { useUserStore } from "./userStore";

type LoginPayLoad = {
    id: number;
    login: string;
    mail: string;
}


type AuthState = {
  login: (user: LoginPayLoad) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>(() => ({

  login: (user: LoginPayLoad) => {
    useUserStore.getState().setUser(user)
  },

  logout: () => {
    useUserStore.getState().clearUser();
  },
}));