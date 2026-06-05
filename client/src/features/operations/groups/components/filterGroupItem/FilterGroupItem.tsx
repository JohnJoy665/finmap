import { Button, Typography } from "antd";
import styles from "./FilterGroupItem.module.css";

const { Text } = Typography;

type FilterGroupItemProps = {
  label: string;
  amount?: string;
  active?: boolean;
  onClick: () => void;
};

function FilterGroupItem({
  label,
  amount,
  active = false,
  onClick,
}: FilterGroupItemProps) {
  return (
    <Button
      type="default"
      onClick={onClick}
      className={`${styles.item} ${active ? styles.active : ""}`}
    >
      <span className={styles.content}>
        <Text className={styles.label}>{label}</Text>

        {amount && <Text className={styles.amount}>{amount}</Text>}
      </span>
    </Button>
  );
}

export default FilterGroupItem;
