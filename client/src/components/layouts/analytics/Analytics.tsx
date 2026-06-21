import { Flex } from "antd";
import CommonDashboards from "../../../features/dashboards/components/commonDashboards/CommonDashboards";
import DashboardPanel from "../../../features/dashboards/components/dashboardPanel/DashboardPanel";
import CategoryWidget from "../../../shared/widgets/categoryWidjet/components/categoryWidget/CategoryWidget";
import GroupWidget from "../../../shared/widgets/categoryWidjet/components/groupWidget/GroupWidget";
import styles from "./Analytics.module.css";
import { useLocation } from "react-router-dom";
function Analytics() {
  const { pathname } = useLocation();
  const isGroupsPage = pathname === "/app/operations";
  const reloadOnAccountChange = !isGroupsPage;

  return (
    <Flex vertical={true} gap={"middle"} className={styles.container}>
      <DashboardPanel>
        <CommonDashboards>
          <CategoryWidget reloadOnAccountChange={reloadOnAccountChange} />
          <GroupWidget reloadOnAccountChange={reloadOnAccountChange} />
        </CommonDashboards>
      </DashboardPanel>
      {/* <DashboardPanel>
        <p>Вот тут все красиво теперь!</p>
      </DashboardPanel> */}
    </Flex>
  );
}

export default Analytics;
