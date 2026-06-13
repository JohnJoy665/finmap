// import Title from "antd/es/typography/Title";
import styles from "./CommonDashboards.module.css";

type CommonDashboardsProps = {
  children: React.ReactNode;
};

function CommonDashboards({ children }: CommonDashboardsProps) {
  return (
    <div className={styles.wrapper}>
      {/* <Title level={4}>Персональные отчеты</Title> */}
      <div className={styles.gridContainer}>{children}</div>
    </div>
  );
}

export default CommonDashboards;
