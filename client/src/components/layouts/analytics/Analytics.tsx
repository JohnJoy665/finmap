import { Flex } from "antd";
import CommonDashboards from "../../../features/dashboards/components/commonDashboards/CommonDashboards";
import DashboardPanel from "../../../features/dashboards/components/dashboardPanel/DashboardPanel";
import CategoryWidget from "../../../shared/widgets/categoryWidjet/components/categoryWidget/CategoryWidget";
import GroupWidget from "../../../shared/widgets/categoryWidjet/components/groupWidget/GroupWidget";
import styles from "./Analytics.module.css";
function Analytics() {
  return (
    <Flex vertical={true} gap={"middle"} className={styles.container}>
      <DashboardPanel>
        <CommonDashboards>
          <CategoryWidget />
          <GroupWidget />
        </CommonDashboards>
      </DashboardPanel>
      <DashboardPanel>
        <p>Вот тут все красиво теперь!</p>
      </DashboardPanel>
    </Flex>
  );
}

export default Analytics;
