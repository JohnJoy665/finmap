import { Outlet } from "react-router-dom";
import TwoPanels from "../../layouts/TwoPanels/TwoPanels";
import RightPanel from "../../layouts/RightPanel";
import Login from "../../components/login/Login";
import Preview from "../../components/preview/Preview";

function Main() {
  const isGuest = true;
  return (
    <TwoPanels
      left={isGuest ? <Login /> : <Outlet />}
      right={isGuest ? <Preview /> : <RightPanel />}
    />
  );
}

export default Main;
