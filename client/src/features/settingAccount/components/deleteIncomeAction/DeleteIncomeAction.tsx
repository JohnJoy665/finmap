import { Button } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

import styles from "./DeleteIncomeAction.module.css";
import type { IncomeItem } from "../accountIncomesSection/AccountIncomesSection";

type DeleteIncomeActionProps = {
  income: IncomeItem;
};

function DeleteIncomeAction({ income }: DeleteIncomeActionProps) {
  function handleDeleteClick() {
    console.log("delete income", income.id);
  }

  return (
    <Button
      block
      danger
      type="text"
      icon={<DeleteOutlined />}
      className={styles.actionButton}
      onClick={handleDeleteClick}
    >
      Удалить пополнение
    </Button>
  );
}

export default DeleteIncomeAction;
