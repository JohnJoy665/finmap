import { Button } from "antd";
import { useModalStore } from "../../../../../shared/ui/modal";
import { useRequestLock } from "../../../../../hooks/useRequestLock";
import { renameGroup as renameGroupReq } from "../../api/renameGroup";
import { useGroupStore } from "../../../../../store/groupStore";

type RenameGroupActionProps = {
  groupId: string;
  groupName: string;
  renameHandle: ({ id, title }: { id: string; title: string }) => void;
};

function RenameGroupAction({
  groupId,
  groupName,
  renameHandle,
}: RenameGroupActionProps) {
  const openModal = useModalStore((store) => store.openModal);
  const { isSubmitting, withRequestLock } = useRequestLock();
  const groups = useGroupStore((store) => store.groups);

  async function getRenamedGroup(groupId: string, groupName: string) {
    try {
      const result = await withRequestLock(async () => {
        const response = await renameGroupReq({ groupId, groupName });
        const id = response.data.groupId;
        const title = response.data.groupName;
        renameHandle({ id, title });
      });

      if (result === undefined) return;
    } catch (error) {
      console.log(error);
    }
  }

  function checkGroupName(newName: string) {
    const trimmedName = newName.trim();
    const normolizedNewName = trimmedName.toLowerCase();
    return groups.find(
      (group) => group.title.toLowerCase() === normolizedNewName
    )
      ? "Группа с подобным названием уже есть"
      : null;
  }

  function onRename() {
    openModal({
      type: "renameItem",
      strategy: "destroy",
      props: {
        validateValue: (value) => {
          return checkGroupName(value);
        },
        itemId: groupId,
        currentValue: groupName ?? "",
        title: "Переименовать группу",
        placeholder: "Название группы",
        onRename: async ({ itemId, name }) => {
          await getRenamedGroup(itemId, name);
        },
      },
    });
  }

  return (
    <Button
      disabled={isSubmitting}
      loading={isSubmitting}
      block
      onClick={onRename}
    >
      Переименовать группу
    </Button>
  );
}

export default RenameGroupAction;
