import { Outlet } from "react-router-dom";
import TwoPanels from "../../layouts/TwoPanels/TwoPanels";
import RightPanel from "../../layouts/RightPanel";

function Main() {
  return (
    <TwoPanels
      left={<Outlet />}
      right={<RightPanel />}
    />
  );
}

export default Main;
