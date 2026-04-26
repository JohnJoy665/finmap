import { useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";

function Header() {
    const isAuth = useAuthStore((state) => state.isAuth);
    const logout = useAuthStore((state) => state.logout);
    const navigate = useNavigate()

    useEffect(()=> {
        if (!isAuth) {
            navigate('/')
        }
    }, [logout, isAuth])

    function handleExit() {
        logout();
    }

    return <button onClick={handleExit}>Выйти</button>
}

export default Header;