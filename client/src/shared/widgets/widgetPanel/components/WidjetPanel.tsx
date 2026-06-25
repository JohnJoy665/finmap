import { Typography, Space } from "antd";

import styles from "./WidjetPanel.module.css";
import type { WidgetPanelSubTitle } from "../../../types/widgetPanel.types";

type WidjetPanelProps = {
  title: string;
  subTitles: WidgetPanelSubTitle[];
  isLoading: boolean;
};

const { Text, Title } = Typography;

function WidjetPanel({ title, subTitles, isLoading }: WidjetPanelProps) {
  const hasData = subTitles.length > 0;

  return (
    <Space orientation="vertical" size={2} className={styles.panel}>
      <Title level={5} className={styles.title}>
        {title}
      </Title>

      {hasData ? (
        subTitles.map((subTitle) => (
          <Text
            key={`${subTitle.subTitle}-${subTitle.value}`}
            type="secondary"
            className={styles.subtitle}
          >
            {subTitle.subTitle} {subTitle.value}
          </Text>
        ))
      ) : (
        <Text type="secondary" className={styles.empty} disabled={isLoading}>
          {isLoading ? "Загрузка..." : "Нет данных"}
        </Text>
      )}
    </Space>
  );
}

export default WidjetPanel;
