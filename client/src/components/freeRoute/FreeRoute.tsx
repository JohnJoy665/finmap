import { Navigate, Outlet  } from "react-router-dom";
import { useUserStore } from "../../store/userStore";

function FreeRoute() {
    const user = useUserStore((state) => state.user);

    if (!user) {
        return <Outlet/>
    }
    
    return <Navigate to="/app/operations" replace/> 
}

export default FreeRoute;