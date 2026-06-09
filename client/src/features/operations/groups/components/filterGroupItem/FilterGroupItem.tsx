import { Button, Typography } from "antd";
import styles from "./FilterGroupItem.module.css";

const { Text } = Typography;

type FilterGroupItemProps = {
  label: string;
  amount?: string;
  active?: boolean;
  onClick: () => void;
  countDays: number;
};

function FilterGroupItem({
  label,
  amount,
  active = false,
  onClick,
  countDays,
}: FilterGroupItemProps) {
  function getFilterLabel(value: string, daysInPeriod: number) {
    if (value === "today") {
      return "Сегодня";
    }

    return `За ${daysInPeriod} ${getRuDayWord(daysInPeriod)}`;
  }

  function getRuDayWord(days: number) {
    const lastDigit = days % 10;
    const lastTwoDigits = days % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
      return "дней";
    }

    if (lastDigit === 1) {
      return "день";
    }

    if (lastDigit >= 2 && lastDigit <= 4) {
      return "дня";
    }

    return "дней";
  }

  return (
    <Button
      type="default"
      onClick={onClick}
      className={`${styles.item} ${active ? styles.active : ""}`}
    >
      <span className={styles.content}>
        <Text className={styles.label}>{getFilterLabel(label, countDays)}</Text>

        {amount && <Text className={styles.amount}>{amount}</Text>}
      </span>
    </Button>
  );
}

export default FilterGroupItem;
