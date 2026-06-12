import CommonDashboards from "../../../features/dashboards/components/commonDashboards/CommonDashboards";
import DashboardPanel from "../../../features/dashboards/components/dashboardPanel/DashboardPanel";
import CategoryWidget from "../../../shared/widgets/categoryWidjet/components/categoryWidget/CategoryWidget";
import styles from "./Analytics.module.css";
function Analytics() {
  return (
    <div className={styles.container}>
      <DashboardPanel>
        <CommonDashboards>
          <CategoryWidget />
        </CommonDashboards>
      </DashboardPanel>
    </div>
  );
}

export default Analytics;
