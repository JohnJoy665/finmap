import { Outlet } from "react-router-dom";
import TwoPanels from "../TwoPanels/TwoPanels";
import RightPanel from "../rightPanel/RightPanel";
import { Grid } from "antd";

function MainLayout() {
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const isMobile = !screens.sm;

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
