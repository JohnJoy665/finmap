import { Outlet } from "react-router-dom";
import TwoPanels from "../../layouts/TwoPanels/TwoPanels";
import RightPanel from "../../layouts/RightPanel";
import { Grid } from "antd";

function Main() {
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

export default Main;
