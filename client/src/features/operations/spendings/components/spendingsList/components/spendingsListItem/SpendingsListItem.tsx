import { Button, Typography } from "antd";
import { EditOutlined, DeleteOutlined, SwapOutlined } from "@ant-design/icons";
import styles from "./SpendingsListItem.module.css";
import type { SpendingByGroupItem } from "../../../../../../../shared/types/spendings,types";

const { Text } = Typography;

type SpendingsListItemProps = {
  spending: SpendingByGroupItem;
};

function SpendingsListItem({ spending }: SpendingsListItemProps) {
  function convertAmount(spending) {
    const displayAmount = Number(spending.amount) / spending.conversionFactor;
    const fraction = String(spending.conversionFactor).length - 1;
    return new Intl.NumberFormat("ru-RU", {
      minimumFractionDigits: fraction,
      maximumFractionDigits: fraction,
    }).format(displayAmount);
  }

  return (
    <div className={styles.header}>
      <div className={styles.info}>
        <Text className={styles.date}>
          {spending.date}/{spending.time}
        </Text>

        <Text className={styles.name}>{spending.title || "Без названия"}</Text>
      </div>

      <Text className={styles.amount}>
        {convertAmount(spending)} {spending.currencySymbol}
      </Text>
    </div>
  );
}

export function SpendingsListItemActions() {
  return (
    <div className={styles.actions}>
      <Button
        block
        type="text"
        icon={<EditOutlined />}
        className={styles.actionButton}
      >
        Изменить название
      </Button>

      <Button
        block
        type="text"
        icon={<EditOutlined />}
        className={styles.actionButton}
      >
        Изменить сумму покупки
      </Button>

      <Button
        block
        type="text"
        icon={<SwapOutlined />}
        className={styles.actionButton}
      >
        Переместить в группу
      </Button>

      <Button
        block
        type="text"
        danger
        icon={<DeleteOutlined />}
        className={styles.actionButton}
      >
        Удалить
      </Button>
    </div>
  );
}

export default SpendingsListItem;
