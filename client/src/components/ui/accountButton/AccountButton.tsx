import { Button } from "antd";
import type { ButtonProps } from "antd";
import { DownOutlined } from "@ant-design/icons";
import styles from "./AccountButton.module.css";

type AccountButtonProps = Omit<ButtonProps, "type"> & {
  amount: string;
  currency: string;
  conversionFactor: number;
  name: string;
};

function AccountButton({
  amount,
  currency,
  conversionFactor,
  name,
  className,
  ...buttonProps
}: AccountButtonProps) {
  const amountNumber = Number(amount);
  const displayAmount = amountNumber / conversionFactor;
  const isNegative = amountNumber < 0;

  const formatted = new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(displayAmount);

  return (
    <Button
      {...buttonProps}
      type="text"
      className={`${styles.button} ${isNegative ? styles.negative : ""} ${
        className ?? ""
      }`}
    >
      <span className={styles.content}>
        <span className={styles.name}>{name}</span>

        <span className={styles.amount}>
          {formatted} {currency}
        </span>
      </span>

      <DownOutlined className={styles.icon} />
    </Button>
  );
}

export default AccountButton;
