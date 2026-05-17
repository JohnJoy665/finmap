import { Button } from "antd";
import { DownOutlined } from "@ant-design/icons";
import styles from "./AccountButton.module.css";

type AccountButtonProps = {
  amount: string;
  currency: string;
  conversionFactor: number;
  onClick?: () => void;
};

function AccountButton({
  amount,
  currency,
  conversionFactor,
  onClick,
}: AccountButtonProps) {
  const displayAmount = Number(amount) / conversionFactor;
  const formatted = new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(displayAmount);

  return (
    <Button type="text" className={styles.button} onClick={onClick}>
      <span className={styles.amount}>
        {formatted} {currency}
      </span>
      <DownOutlined className={styles.icon} />
    </Button>
  );
}

export default AccountButton;
