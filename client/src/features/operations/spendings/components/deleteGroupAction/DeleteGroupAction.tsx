import { Button } from "antd";
import { useProfileStore } from "../../../../../store/profileStore";
import { useRequestLock } from "../../../../../hooks/useRequestLock";
import { useModalStore } from "../../../../../shared/ui/modal";
import { deleteGroupWithSpending } from "../../../groups/api/deleteGroupWithSpendings";
import { useNavigate } from "react-router-dom";
import { useAccountsStore } from "../../../../../store/accountsStore";

type DeleteGroupButtonProps = {
  groupId: string;
};

function DeleteGroupAction({ groupId }: DeleteGroupButtonProps) {
  const navigate = useNavigate();
  const openModal = useModalStore((state) => state.openModal);
  const { isSubmitting, withRequestLock } = useRequestLock();
  const updateProfileAmount = useProfileStore(
    (state) => state.updateProfileAmount
  );
  const updateListAmountAccounts = useAccountsStore(
    (store) => store.updateListAmountAccounts
  );
  const activeAccount = useProfileStore((state) => state.account.id);

  function handleCancel() {
    navigate("/app/operations");
  }

  async function handleGroupDelete(groupId: string) {
    const result = await withRequestLock(async () => {
      const deletedGoup = await deleteGroupWithSpending(groupId); // TODO поменять на [{acountId, amount}]
      updateProfileAmount(deletedGoup.data.accountAmount); // передавать только тот, который активный
      updateListAmountAccounts(activeAccount, deletedGoup.data.accountAmount);
      return deletedGoup;
    });

    if (result === undefined) return;

    handleCancel();
  }

  function onDelete() {
    openModal({
      type: "confirmAction",
      strategy: "destroy",
      props: {
        danger: true,
        title: "Удалить группу",
        content: "Удалить группу и все ее расходы",
        confirmText: "Ок",
        cancelText: "Отмена",
        onConfirm: () => handleGroupDelete(groupId),
      },
    });
  }

  return (
    <Button
      disabled={isSubmitting}
      loading={isSubmitting}
      block
      danger
      onClick={onDelete}
    >
      Удалить группу
    </Button>
  );
}

export default DeleteGroupAction;
