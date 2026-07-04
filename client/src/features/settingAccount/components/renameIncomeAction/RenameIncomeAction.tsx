import { Button } from "antd";
import { EditOutlined } from "@ant-design/icons";

import styles from "./RenameIncomeAction.module.css";
import type { IncomeItem } from "../accountIncomesSection/AccountIncomesSection";
import { useModalStore } from "../../../../shared/ui/modal";
import { renameIncome } from "../../api/renameIncome";

type RenameIncomeActionProps = {
  income: IncomeItem;
  handleRenameIncome: (IncomeId: string, newName: string) => void;
};

function RenameIncomeAction({
  income,
  handleRenameIncome,
}: RenameIncomeActionProps) {
  const openModal = useModalStore((store) => store.openModal);

  async function getRenameIncome(incomeId: string, newName: string) {
    try {
      const response = await renameIncome({
        incomeId,
        newName,
      });
      handleRenameIncome(
        response.data.incomeId,
        response.data.currentName || ""
      );
    } catch (error) {
      console.log(error);
    }
  }

  function handleRenameClick() {
    openModal({
      type: "renameItem",
      strategy: "destroy",
      props: {
        itemId: income.id,
        currentValue: income.name ?? "",
        title: "Переименовать пополнение",
        placeholder: "Название пополнения",
        onRename: async ({ itemId, name }) => {
          await getRenameIncome(itemId, name);
        },
      },
    });
  }

  return (
    <Button
      block
      type="text"
      icon={<EditOutlined />}
      className={styles.actionButton}
      onClick={handleRenameClick}
    >
      Изменить название
    </Button>
  );
}

export default RenameIncomeAction;
