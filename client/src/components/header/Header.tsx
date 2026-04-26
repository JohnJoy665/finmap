import { useAuthStore } from "../../store/authStore";

function Header() {
    const logout = useAuthStore((state) => state.logout);

    return <button onClick={logout}>Выйти</button>
}

export default Header;