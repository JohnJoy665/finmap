import { Button } from "antd";
import { DownOutlined } from "@ant-design/icons";
import styles from "./BalanceButton.module.css";

type BalanceButtonProps = {
  amount: number;
  currency: string;
  onClick?: () => void;
};

function BalanceButton({ amount, currency, onClick }: BalanceButtonProps) {
  const formatted = new Intl.NumberFormat("ru-RU").format(amount);

  return (
    <Button type="text" className={styles.button} onClick={onClick}>
      <span className={styles.amount}>
        {formatted} {currency}
      </span>
      <DownOutlined className={styles.icon} />
    </Button>
  );
}

export default BalanceButton;