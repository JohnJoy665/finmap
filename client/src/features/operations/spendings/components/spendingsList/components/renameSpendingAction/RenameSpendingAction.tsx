import { Button } from "antd";
import { useModalStore } from "../../../../../../../shared/ui/modal";
import { EditOutlined } from "@ant-design/icons";
import type { SpendingByGroupItem } from "../../../../../../../shared/types/spendings.types";
import { renameSpending } from "../../../../api/renameSpending";
import styles from "./RenameSpendingAction.module.css";

type RenameSpendingActionProps = {
  spending: SpendingByGroupItem;
  handleRenameSpending: (spendingId: string, newName: string) => void;
};

function RenameSpendingAction({
  spending,
  handleRenameSpending,
}: RenameSpendingActionProps) {
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

export default RenameSpendingAction;
