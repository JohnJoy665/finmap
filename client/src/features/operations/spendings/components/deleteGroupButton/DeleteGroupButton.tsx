import { Button } from "antd";

type DeleteGroupButtonProps = {
  groupId: string;
  handleGroupDelete: (groupId: string) => void;
};

function DeleteGroupButton({
  handleGroupDelete,
  groupId,
}: DeleteGroupButtonProps) {
  return (
    <Button block danger onClick={() => handleGroupDelete(groupId)}>
      Удалить группу
    </Button>
  );
}

export default DeleteGroupButton;
