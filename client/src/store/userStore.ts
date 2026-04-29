import { create } from "zustand";

type User = {
    id: number;
    login: string;
    mail: string;
}

type UserState = {
    user: User | null;
    setUser: (user: User) => void;
    clearUser: () => void;
}

export const useUserStore = create<UserState>((set) => ({
    user: null,
    setUser: (user) => set({user}),
    clearUser: () => set({user: null})
}))