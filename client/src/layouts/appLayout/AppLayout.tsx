import { Outlet } from "react-router-dom";
import Header from "../../components/header/Header";
import { Flex } from "antd";

function AppLayout() {
  return (
    <Flex vertical gap={'large'}>
      <Header />
      <Outlet />
    </Flex>
  );
}

export default AppLayout;
