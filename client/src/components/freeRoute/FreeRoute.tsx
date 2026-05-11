import { Navigate, Outlet  } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

function FreeRoute() {
    const user = useAuthStore((state) => state.user);

    if (!user) {
        return <Outlet/>
    }
    
    return <Navigate to="/app/operations" replace/> 
}

export default FreeRoute;