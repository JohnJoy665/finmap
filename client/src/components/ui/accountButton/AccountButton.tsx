import { Button } from "antd";
import type { ButtonProps } from "antd";
import { DownOutlined } from "@ant-design/icons";
import styles from "./AccountButton.module.css";

type AccountButtonProps = Omit<ButtonProps, "type"> & {
  amount: string;
  currency: string;
  conversionFactor: number;
};

function AccountButton({
  amount,
  currency,
  conversionFactor,
  ...buttonProps
}: AccountButtonProps) {
  const displayAmount = Number(amount) / conversionFactor;

  const formatted = new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(displayAmount);

  return (
    <Button {...buttonProps} type="text" className={styles.button}>
      <span className={styles.amount}>
        {formatted} {currency}
      </span>
      <DownOutlined className={styles.icon} />
    </Button>
  );
}

export default AccountButton;
