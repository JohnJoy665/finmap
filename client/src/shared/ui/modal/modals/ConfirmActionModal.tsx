import { useState } from "react";
import type { ConfirmActionModalProps } from "../model/modal.types";
import { useModalStore } from "../model/modalStore";
import BaseModal from "../ui/BaseModal";
import { Button, Flex } from "antd";

type Props = ConfirmActionModalProps & {
  modalId: string;
  open: boolean;
};

function ConfirmActionModal({
  modalId,
  open,
  title,
  content,
  confirmText = "Подтвердить",
  cancelText = "Отмена",
  danger = false,
  onConfirm,
  onCancel,
}: Props) {
  const closeModalById = useModalStore((store) => store.closeModalById);

  const [isLoading, setIsLoading] = useState(false);

  async function handleConfirm() {
    try {
      setIsLoading(true);
      await onConfirm();
      closeModalById(modalId);
    } finally {
      setIsLoading(false);
    }
  }

  function handleCancel() {
    onCancel?.();
    closeModalById(modalId);
  }

  return (
    <BaseModal
      open={open}
      title={title}
      onCancel={handleCancel}
      footer={null}
      keepAlive={false}
    >
      {content}

      <Flex justify="flex-end" gap={8} style={{ marginTop: 24 }}>
        <Button onClick={handleCancel}>{cancelText}</Button>

        <Button
          type="primary"
          danger={danger}
          loading={isLoading}
          onClick={handleConfirm}
        >
          {confirmText}
        </Button>
      </Flex>
    </BaseModal>
  );
}

export default ConfirmActionModal;
