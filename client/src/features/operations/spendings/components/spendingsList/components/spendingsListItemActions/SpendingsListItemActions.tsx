import { DeleteOutlined, EditOutlined, SwapOutlined } from "@ant-design/icons";
import { Button } from "antd";
import styles from "./SpendingsListItemActions.module.css";
import { useModalStore } from "../../../../../../../shared/ui/modal";
import type { SpendingByGroupItem } from "../../../../../../../shared/types/spendings,types";
import { renameSpending } from "../../../../api/renameSpending";
import { changeSpendingAmount } from "../../../../api/changeSpendingAmount";

type SpendingsListItemActionsProps = {
  spending: SpendingByGroupItem;
  handleRenameSpending: (spendingId: string, newName: string) => void;
  handleChangeSpendingAmount: (
    spendingId: string,
    newAmountSpending: string,
    accountId: string,
    newAccountSpending: string
  ) => void;
};

function SpendingsListItemActions({
  spending,
  handleRenameSpending,
  handleChangeSpendingAmount,
}: SpendingsListItemActionsProps) {
  const openModal = useModalStore((store) => store.openModal);

  async function getRenamedSpending(spendingId, currentName) {
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
    spendingId,
    spendingAmount,
    conversionFactor
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
        icon={<SwapOutlined />}
        className={styles.actionButton}
      >
        Изменить категорию
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
export default SpendingsListItemActions;
