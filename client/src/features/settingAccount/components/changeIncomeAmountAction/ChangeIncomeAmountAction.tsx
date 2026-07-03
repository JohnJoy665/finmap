import { Button } from "antd";
import { DollarOutlined } from "@ant-design/icons";

import styles from "./ChangeIncomeAmountAction.module.css";
import type { IncomeItem } from "../accountIncomesSection/AccountIncomesSection";

type ChangeIncomeAmountActionProps = {
  income: IncomeItem;
};

function ChangeIncomeAmountAction({ income }: ChangeIncomeAmountActionProps) {
  function handleChangeAmountClick() {
    console.log("change income amount", income.id);
  }

  return (
    <Button
      block
      type="text"
      icon={<DollarOutlined />}
      className={styles.actionButton}
      onClick={handleChangeAmountClick}
    >
      Изменить сумму
    </Button>
  );
}

export default ChangeIncomeAmountAction;
