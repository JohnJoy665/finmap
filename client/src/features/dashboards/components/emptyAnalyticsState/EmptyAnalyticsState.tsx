import { InboxOutlined } from "@ant-design/icons";
import { Typography } from "antd";

import styles from "./EmptyAnalyticsState.module.css";

const { Title, Text } = Typography;

function EmptyAnalyticsState() {
  return (
    <section className={styles.container}>
      <div className={styles.card}>
        <div className={styles.iconWrap}>
          <InboxOutlined className={styles.icon} />
        </div>

        <div className={styles.content}>
          <Title level={4} className={styles.title}>
            Пока нет данных для отображения
          </Title>

          <Text className={styles.text}>
            Добавьте первую трату, чтобы увидеть аналитику, графики и сводки по
            вашим расходам.
          </Text>
        </div>
      </div>
    </section>
  );
}

export default EmptyAnalyticsState;
