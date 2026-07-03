import { Typography } from "antd";

import styles from "./IncomeHistoryListItem.module.css";
import type { IncomeItem } from "../accountIncomesSection/AccountIncomesSection";

const { Text } = Typography;

type IncomeHistoryListItemProps = {
  income: IncomeItem;
};

function IncomeHistoryListItem({ income }: IncomeHistoryListItemProps) {
  function convertAmount(income: IncomeItem) {
    const displayAmount = Number(income.amount) / income.conversionFactor;
    const fraction = String(income.conversionFactor).length - 1;

    return new Intl.NumberFormat("ru-RU", {
      minimumFractionDigits: fraction,
      maximumFractionDigits: fraction,
    }).format(displayAmount);
  }

  return (
    <div className={styles.header}>
      <div className={styles.info}>
        <Text className={styles.date}>
          {income.date}/{income.time}
        </Text>

        <Text className={styles.name}>{income.name || "Без названия"}</Text>
      </div>

      <Text className={styles.amount}>
        {convertAmount(income)} {income.currencySymbol}
      </Text>
    </div>
  );
}

export default IncomeHistoryListItem;
