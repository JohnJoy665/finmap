import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { useCheckAuth } from "../hooks/useCheckAuth";
import { useAuthStore } from "../store/authStore";

function App() {
  useCheckAuth();

  const isAuthChecked = useAuthStore((state) => state.isAuthChecked);

  if (!isAuthChecked) {
    return null;
  }

  return <RouterProvider router={router} />;
}

export default App;
