import { Button } from "antd";
import { DeleteOutlined } from "@ant-design/icons";

import styles from "./DeleteIncomeAction.module.css";
import type { IncomeItem } from "../accountIncomesSection/AccountIncomesSection";
import { useModalStore } from "../../../../shared/ui/modal";
import { deleteIncome } from "../../api/deleteIncome";

type DeleteIncomeActionProps = {
  income: IncomeItem;
  handleDeleteIncome: (
    incomeId: string,
    accountId: string,
    accountAmount: string
  ) => void;
};

function DeleteIncomeAction({
  income,
  handleDeleteIncome,
}: DeleteIncomeActionProps) {
  const openModal = useModalStore((store) => store.openModal);

  async function getDeleteIncome(incomeId: string) {
    try {
      const response = await deleteIncome(incomeId);
      handleDeleteIncome(
        response.data.incomeId,
        response.data.accountId,
        response.data.accountAmount
      );
    } catch (error) {
      console.log(error);
    }
  }

  function deleteSpendingClick() {
    openModal({
      type: "confirmAction",
      strategy: "destroy",
      props: {
        danger: true,
        title: `Удалить пополнение`,
        content: `Удалить пополнение "${income.name || "Без названия"}"`,
        confirmText: "Ок",
        cancelText: "Отмена",
        onConfirm: async () => getDeleteIncome(income.id),
      },
    });
  }

  return (
    <Button
      block
      danger
      type="text"
      icon={<DeleteOutlined />}
      className={styles.actionButton}
      onClick={deleteSpendingClick}
    >
      Удалить пополнение
    </Button>
  );
}

export default DeleteIncomeAction;
