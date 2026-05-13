import { useEffect, useRef } from "react";
import { useAuthStore } from "../store/authStore";
import { getMeRequest } from "../api/authApi";

export function useCheckAuth() {
  const token = useAuthStore((state) => state.token);
  const setUser = useAuthStore((state) => state.setUser);
  const logout = useAuthStore((state) => state.logout);
  const setAuthChecked = useAuthStore((state) => state.setAuthChecked);

  const didChecked = useRef(false);

  useEffect(() => {
    if (didChecked.current) return;

    didChecked.current = true;

    async function checkAuth() {
      if (!token) {
        setAuthChecked(true);
        return;
      }

      try {
        const response = await getMeRequest();
        setUser(response.data);
      } catch {
        logout();
      } finally {
        setAuthChecked(true);
      }
    }

    checkAuth();
  }, [token, setUser, logout, setAuthChecked]);
}
