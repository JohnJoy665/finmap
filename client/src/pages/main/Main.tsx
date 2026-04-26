import { Outlet } from "react-router-dom";
import TwoPanels from "../../layouts/TwoPanels/TwoPanels";
import RightPanel from "../../layouts/RightPanel";
import Login from "../../components/login/Login";
import Preview from "../../components/preview/Preview";
import { useAuthStore } from "../../store/authStore";

function Main() {
    const isAuth = useAuthStore(state => state.isAuth)
  return (
    <TwoPanels
      left={!isAuth ? <Login /> : <Outlet />}
      right={!isAuth ? <Preview /> : <RightPanel />}
    />
  );
}

export default Main;
