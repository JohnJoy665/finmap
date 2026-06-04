import { Button, Flex, Input } from "antd";
import { useState } from "react";
import type { RenameSpendingModalProps } from "../model/modal.types";
import { useModalStore } from "../model/modalStore";
import BaseModal from "../ui/BaseModal";

type Props = RenameSpendingModalProps & {
  modalId: string;
  open: boolean;
};

function RenameSpendingModal({
  modalId,
  open,
  spendingId,
  currentName,
  onRename,
}: Props) {
  const closeModalById = useModalStore((store) => store.closeModalById);

  const [name, setName] = useState(currentName);
  const [isLoading, setIsLoading] = useState(false);

  const trimmedName = name.trim();
  const isNameChanged = trimmedName !== currentName.trim();
  const isSubmitDisabled = !trimmedName || !isNameChanged;

  function handleCancel() {
    closeModalById(modalId);
  }

  async function handleConfirm() {
    if (isSubmitDisabled) return;

    try {
      setIsLoading(true);

      await onRename({
        spendingId,
        name: trimmedName,
      });

      closeModalById(modalId);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <BaseModal
      open={open}
      title="Переименовать покупку?"
      onCancel={handleCancel}
      footer={null}
      keepAlive={false}
    >
      <Input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder="Название покупки"
        onPressEnter={handleConfirm}
      />

      <Flex justify="flex-end" gap={8} style={{ marginTop: 24 }}>
        <Button onClick={handleCancel}>Отмена</Button>

        <Button
          type="primary"
          loading={isLoading}
          disabled={isSubmitDisabled}
          onClick={handleConfirm}
        >
          Да
        </Button>
      </Flex>
    </BaseModal>
  );
}

export default RenameSpendingModal;
