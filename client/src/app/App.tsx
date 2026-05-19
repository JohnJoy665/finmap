import { RouterProvider } from "react-router-dom";
import { router } from "./router";
import { useCheckAuth } from "../hooks/useCheckAuth";
import { useAuthStore } from "../store/authStore";
import { ModalRoot } from "../shared/ui/modal";

function App() {
  useCheckAuth();

  const isAuthChecked = useAuthStore((state) => state.isAuthChecked);

  if (!isAuthChecked) {
    return null;
  }

  return (
    <>
      <RouterProvider router={router} />
      <ModalRoot />
    </>
  );
}

export default App;
