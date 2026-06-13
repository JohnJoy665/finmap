import { Outlet } from "react-router-dom";
import TwoPanels from "../TwoPanels/TwoPanels";
import RightPanel from "../rightPanel/RightPanel";
import useIsMobile from "../../hooks/useIsMobile";

function MainLayout() {
  const { isMobile } = useIsMobile();
  return (
    <TwoPanels
      left={
        <>
          <Outlet />
        </>
      }
      right={!isMobile && <RightPanel />}
    />
  );
}

export default MainLayout;
