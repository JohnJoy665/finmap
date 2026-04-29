import { Navigate, Outlet  } from "react-router-dom";
import { useUserStore } from "../../store/userStore";

function ProtectedRoute() {

    const user = useUserStore((state) => state.user)

    if (!user) {
        return <Navigate to="/login" replace/>
    }
    
    return <Outlet/>

}

export default ProtectedRoute;