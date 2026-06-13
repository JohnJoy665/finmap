import { Typography, Space } from "antd";
import type { CategoryStatisticsWidgetSubTitle } from "../../api/getCategoryStatisticsWidget";
import styles from "./CategoryWidjetPanel.module.css";

type CategoryWidjetPanelProps = {
  title: string;
  subTitles: CategoryStatisticsWidgetSubTitle[];
  isLoading: boolean;
};

const { Text, Title } = Typography;

function CategoryWidjetPanel({
  title,
  subTitles,
  isLoading,
}: CategoryWidjetPanelProps) {
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

export default CategoryWidjetPanel;
