import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button } from "antd";
import styles from "./SpendingsListItemActions.module.css";
import { useModalStore } from "../../../../../../../shared/ui/modal";
import type { SpendingByGroupItem } from "../../../../../../../shared/types/spendings,types";
import { renameSpending } from "../../../../api/renameSpending";
import { changeSpendingAmount } from "../../../../api/changeSpendingAmount";
import { deleteSpending } from "../../../../api/deleteSpending";

type SpendingsListItemActionsProps = {
  spending: SpendingByGroupItem;
  handleRenameSpending: (spendingId: string, newName: string) => void;
  handleChangeSpendingAmount: (
    spendingId: string,
    newAmountSpending: string,
    accountId: string,
    newAccountSpending: string
  ) => void;
  handleDeleteSpending: (
    spendingId: string,
    accountId: string,
    accountAmount: string
  ) => void;
  isLastSpending: boolean;
};

function SpendingsListItemActions({
  spending,
  handleRenameSpending,
  handleChangeSpendingAmount,
  handleDeleteSpending,
  isLastSpending,
}: SpendingsListItemActionsProps) {
  const openModal = useModalStore((store) => store.openModal);

  async function getRenamedSpending(spendingId: string, currentName: string) {
    try {
      const renamedSpending = await renameSpending({ spendingId, currentName });
      handleRenameSpending(
        renamedSpending.data.spendingId,
        renamedSpending.data.currentName
      );
    } catch (error) {
      console.log(error);
    }
  }

  function handleRenameClick() {
    openModal({
      type: "renameSpending",
      strategy: "destroy",
      props: {
        spendingId: spending.id,
        currentName: spending.title ?? "",
        onRename: async ({ spendingId, name }) => {
          await getRenamedSpending(spendingId, name);
        },
      },
    });
  }

  async function getChangeSpendingAmount(
    spendingId: string,
    spendingAmount: string,
    conversionFactor: number
  ) {
    try {
      const changedSpending = await changeSpendingAmount({
        spendingId,
        spendingAmount: String(Number(spendingAmount) * conversionFactor),
      });
      handleChangeSpendingAmount(
        changedSpending.data.spendingId,
        changedSpending.data.spendingAmount,
        changedSpending.data.accountId,
        changedSpending.data.accountAmount
      );
    } catch (error) {
      console.log(error);
    }
  }

  function handleChangeAmount() {
    openModal({
      type: "changeSpendingAmount",
      strategy: "destroy",
      props: {
        conversionFactor: spending.conversionFactor,
        currencySymbol: spending.currencySymbol,
        accountAmount: String(
          Number(spending.amount) / spending.conversionFactor
        ),
        spendingId: spending.id,
        onChangeAmount: async (values) => {
          await getChangeSpendingAmount(
            values.spendingId,
            values.spendingAmount,
            spending.conversionFactor
          );
        },
      },
    });
  }

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
    <div className={styles.actions}>
      <Button
        block
        type="text"
        icon={<EditOutlined />}
        className={styles.actionButton}
        onClick={handleRenameClick}
      >
        Изменить название
      </Button>

      <Button
        block
        type="text"
        icon={<EditOutlined />}
        className={styles.actionButton}
        onClick={handleChangeAmount}
      >
        Изменить сумму покупки
      </Button>

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
    </div>
  );
}
export default SpendingsListItemActions;
