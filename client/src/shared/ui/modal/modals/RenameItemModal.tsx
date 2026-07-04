import { Button, Flex, Input } from "antd";
import { useState } from "react";
import type { RenameItemModalProps } from "../model/modal.types";
import { useModalStore } from "../model/modalStore";
import BaseModal from "../ui/BaseModal";

type Props = RenameItemModalProps & {
  modalId: string;
  open: boolean;
};

function RenameItemModal({
  modalId,
  open,
  itemId,
  currentValue,
  title,
  placeholder,
  onRename,
}: Props) {
  const closeModalById = useModalStore((store) => store.closeModalById);

  const [name, setName] = useState(currentValue);
  const [isLoading, setIsLoading] = useState(false);

  const trimmedName = name.trim();
  const isNameChanged = trimmedName !== currentValue.trim();
  const isSubmitDisabled = !trimmedName || !isNameChanged;

  function handleCancel() {
    closeModalById(modalId);
  }

  async function handleConfirm() {
    if (isSubmitDisabled) return;

    try {
      setIsLoading(true);

      await onRename({
        itemId,
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
      title={title}
      onCancel={handleCancel}
      footer={null}
      keepAlive={false}
    >
      <Input
        value={name}
        onChange={(event) => setName(event.target.value)}
        placeholder={placeholder}
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

export default RenameItemModal;
