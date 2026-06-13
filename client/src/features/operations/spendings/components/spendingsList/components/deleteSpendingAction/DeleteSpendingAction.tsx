import { DeleteOutlined } from "@ant-design/icons";
import { Button } from "antd";
import styles from "./DeleteSpendingAction.module.css";
import { useModalStore } from "../../../../../../../shared/ui/modal";
import type { SpendingByGroupItem } from "../../../../../../../shared/types/spendings.types";
import { deleteSpending } from "../../../../api/deleteSpending";

type DeleteSpendingActionProps = {
  spending: SpendingByGroupItem;
  handleDeleteSpending: (
    spendingId: string,
    accountId: string,
    accountAmount: string
  ) => void;
  isLastSpending: boolean;
};

function DeleteSpendingAction({
  spending,
  handleDeleteSpending,
  isLastSpending,
}: DeleteSpendingActionProps) {
  const openModal = useModalStore((store) => store.openModal);

  async function getDeleteGroup() {
    try {
      const deletedSpending = await deleteSpending(spending.id);
      handleDeleteSpending(
        deletedSpending.data.spendingId,
        deletedSpending.data.accountId,
        deletedSpending.data.accountAmount
      );

      // message.success(deletedSpending.message);
    } catch (error) {
      console.log(error);
      // message.error(error.message);
    }
  }

  function deleteSpendingClick() {
    openModal({
      type: "confirmAction",
      strategy: "destroy",
      props: {
        danger: true,
        title: `Удалить покупку`,
        content: `Удалить покпку "${spending.title || "Без названия"}"`,
        confirmText: "Ок",
        cancelText: "Отмена",
        onConfirm: async () => getDeleteGroup(),
      },
    });
  }

  return (
    <Button
      block
      type="text"
      danger
      icon={<DeleteOutlined />}
      className={styles.actionButton}
      onClick={deleteSpendingClick}
      disabled={isLastSpending}
    >
      Удалить
    </Button>
  );
}

export default DeleteSpendingAction;
