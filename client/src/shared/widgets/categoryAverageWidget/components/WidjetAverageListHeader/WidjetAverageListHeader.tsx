import { Typography } from "antd";

import styles from "./WidjetAverageListHeader.module.css";

type AverageMode = "average" | "median";

type WidjetAverageListHeaderProps = {
  mode: AverageMode;
};

function WidjetAverageListHeader({ mode }: WidjetAverageListHeaderProps) {
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

export default WidjetAverageListHeader;
