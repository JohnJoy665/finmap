import { Flex } from "antd";
import styles from "./OperationsAnalytics.module.css";
import { useLocation } from "react-router-dom";
import DashboardPanel from "../dashboardPanel/DashboardPanel";
import CommonDashboards from "../commonDashboards/CommonDashboards";
import CategoryWidget from "../../../../shared/widgets/categoryWidjet/components/categoryWidget/CategoryWidget";
import GroupWidget from "../../../../shared/widgets/groupWidget/components/groupWidget/GroupWidget";
import CategoryAverageWidget from "../../../../shared/widgets/categoryAverageWidget/components/categoryAverageWidget/CategoryAverageWidget";
import GroupAverageWidget from "../../../../shared/widgets/groupAverageWidget/components/groupAverageWidget/GroupAverageWidget";

function OperationsAnalytics() {
  const { pathname } = useLocation();

  const isGroupsPage = pathname === "/app/operations";
  const reloadOnAccountChange = !isGroupsPage;

  return (
    <Flex vertical gap="middle" className={styles.container}>
      <DashboardPanel>
        <CommonDashboards>
          <CategoryWidget reloadOnAccountChange={reloadOnAccountChange} />
          <GroupWidget reloadOnAccountChange={reloadOnAccountChange} />
          <CategoryAverageWidget
            reloadOnAccountChange={reloadOnAccountChange}
          />
          <GroupAverageWidget reloadOnAccountChange={reloadOnAccountChange} />
        </CommonDashboards>
      </DashboardPanel>
    </Flex>
  );
}

export default OperationsAnalytics;
