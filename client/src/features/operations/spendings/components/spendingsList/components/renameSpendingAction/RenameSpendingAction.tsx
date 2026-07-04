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
      type: "renameItem",
      strategy: "destroy",
      props: {
        itemId: spending.id,
        currentValue: spending.title ?? "",
        title: "Переименовать покупку",
        placeholder: "Название покупки",
        onRename: async ({ itemId, name }) => {
          await getRenamedSpending(itemId, name);
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
