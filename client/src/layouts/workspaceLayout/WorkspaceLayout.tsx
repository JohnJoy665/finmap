import { Outlet } from "react-router-dom";
import Header from "../../components/layouts/header/Header";
import { Flex } from "antd";

function WorkspaceLayout() {
  return (
    <Flex vertical gap={"large"}>
      <Header />
      <Outlet />
    </Flex>
  );
}

export default WorkspaceLayout;
