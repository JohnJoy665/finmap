import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

function ProtectedRoute() {
  const user = useAuthStore((state) => state.user);
  const isAuthChecked = useAuthStore((state) => state.isAuthChecked);

  if (!isAuthChecked) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
