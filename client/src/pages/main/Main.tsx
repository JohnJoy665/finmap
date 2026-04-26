import { Outlet } from "react-router-dom";
import TwoPanels from "../../layouts/TwoPanels/TwoPanels";
import RightPanel from "../../layouts/RightPanel";
import { Header } from "antd/es/layout/layout";

function Main() {
  return (
    <TwoPanels
      left={
        <>
          <Header />
          <Outlet />
        </>
      }
      right={<RightPanel />}
    />
  );
}

export default Main;
