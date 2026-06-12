import { Outlet } from "react-router-dom";
import Header from "../../components/layouts/header/Header";
import { Flex } from "antd";
import { useEffect } from "react";
import { getAccounts } from "../../features/selectAccount/api/getAccounts";
import { useAccountsStore } from "../../store/accountsStore";
import styles from "./WorkSpaceLayout.module.css";
import useIsMobile from "../../hooks/useIsMobile";

function WorkspaceLayout() {
  const setAccounts = useAccountsStore((store) => store.setAccounts);
  const { isMobile } = useIsMobile();
  useEffect(() => {
    async function getAccountsData() {
      const response = await getAccounts();
      setAccounts(response.data);
    }
    getAccountsData();
  }, [setAccounts]);

  return (
    <Flex gap={"large"} vertical className={styles.layout}>
      <div className={styles.header}>
        <Header />
      </div>

      <main
        className={`${styles.content} ${isMobile ? styles["content--mobile"] : styles["content--desctop"]}`}
      >
        <Flex gap={"large"} vertical>
          <Outlet />
        </Flex>
      </main>
    </Flex>
  );
}

export default WorkspaceLayout;
