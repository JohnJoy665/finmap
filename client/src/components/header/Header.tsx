import { useAuthStore } from "../../store/authStore";
import { useUserStore } from "../../store/userStore";

function Header() {
    const logout = useAuthStore((state) => state.logout);
    const user = useUserStore().user


    return (
        <>
        <p>Привет {user.login}</p>
        <button onClick={logout}>Выйти</button>
        </>
    )
}

export default Header;