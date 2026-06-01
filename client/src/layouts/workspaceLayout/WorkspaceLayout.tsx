import { Outlet } from "react-router-dom";
import Header from "../../components/layouts/header/Header";
import { Flex } from "antd";
import { useEffect } from "react";
import { getAccounts } from "../../features/selectAccount/api/getAccounts";
import { useAccountsStore } from "../../store/accountsStore";

function WorkspaceLayout() {
  const setAccounts = useAccountsStore((store) => store.setAccounts);

  useEffect(() => {
    async function getAccountsData() {
      const response = await getAccounts();
      setAccounts(response.data);
    }
    getAccountsData();
  }, [setAccounts]);

  return (
    <Flex vertical gap={"large"}>
      <Header />
      <Outlet />
    </Flex>
  );
}

export default WorkspaceLayout;
