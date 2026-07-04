import { BarChartOutlined } from "@ant-design/icons";
import { Typography } from "antd";

import styles from "./DefaultPanel.module.css";

const { Title, Text } = Typography;

function DefaultPanel() {
  return (
    <section className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconWrap}>
          <BarChartOutlined className={styles.icon} />
        </div>

        <div className={styles.content}>
          <Title level={4} className={styles.title}>
            Аналитика и отчеты в разработке
          </Title>

          <Text className={styles.text}>
            Скоро в этом разделе появятся графики, сводки по расходам, динамика
            баланса и полезные финансовые инсайты.
          </Text>
        </div>
      </div>
    </section>
  );
}

export default DefaultPanel;
