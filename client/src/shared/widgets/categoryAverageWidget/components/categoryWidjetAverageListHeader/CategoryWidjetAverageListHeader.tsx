import { Typography } from "antd";

import styles from "./CategoryWidjetAverageListHeader.module.css";

type AverageMode = "average" | "median";

type CategoryWidjetAverageListHeaderProps = {
  mode: AverageMode;
};

function CategoryWidjetAverageListHeader({
  mode,
}: CategoryWidjetAverageListHeaderProps) {
  const { Text } = Typography;

  const amountTitle = mode === "median" ? "Медианный чек" : "Средний чек";

  return (
    <div className={styles.header}>
      <Text className={styles.title}>Категория</Text>
      <Text className={styles.title}>Покупок</Text>
      <Text className={styles.title}>{amountTitle}</Text>
    </div>
  );
}

export default CategoryWidjetAverageListHeader;
