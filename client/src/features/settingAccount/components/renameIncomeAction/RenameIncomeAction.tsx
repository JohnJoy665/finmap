import { Button } from "antd";
import { EditOutlined } from "@ant-design/icons";

import styles from "./RenameIncomeAction.module.css";
import type { IncomeItem } from "../accountIncomesSection/AccountIncomesSection";
import { useModalStore } from "../../../../shared/ui/modal";

type RenameIncomeActionProps = {
  income: IncomeItem;
  handleRenameIncome: (IncomeId: string, newName: string) => void;
};

function RenameIncomeAction({
  income,
  handleRenameIncome,
}: RenameIncomeActionProps) {
  const openModal = useModalStore((store) => store.openModal);

  function getRenamedincome(id, name) {
    handleRenameIncome(id, name);
  }

  function handleRenameClick() {
    openModal({
      type: "renameSpending",
      strategy: "destroy",
      props: {
        spendingId: income.id,
        currentName: income.name ?? "",
        onRename: async ({ spendingId, name }) => {
          await getRenamedincome(spendingId, name);
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
