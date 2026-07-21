import { Button, Flex, Form, Input } from "antd";
import { useState } from "react";
import type { RenameItemModalProps } from "../model/modal.types";
import { useModalStore } from "../model/modalStore";
import BaseModal from "../ui/BaseModal";
import type { RuleObject } from "antd/es/form";

type RenameItemFormValues = {
  name: string;
};

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
  validateValue,
}: Props) {
  const [form] = Form.useForm<RenameItemFormValues>();
  const closeModalById = useModalStore((store) => store.closeModalById);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  function handleCancel() {
    closeModalById(modalId);
  }

  function handleFieldsChange() {
    const hasErrors = form
      .getFieldsError()
      .some((field) => field.errors.length > 0);

    const name = form.getFieldValue("name") ?? "";

    const trimmedName = name.trim();
    const trimmedCurrentValue = currentValue.trim();

    const isEmpty = !trimmedName;
    const isNotChanged = trimmedName === trimmedCurrentValue;
    const isTooLong = trimmedName.length > 25;

    setIsSubmitDisabled(hasErrors || isEmpty || isNotChanged || isTooLong);
  }

  async function handleSubmit(values: RenameItemFormValues) {
    const trimmedName = values.name.trim();

    if (!trimmedName || trimmedName === currentValue.trim()) {
      return;
    }

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

  function customValidate(_: RuleObject, value?: string) {
    const trimmedName = value?.trim() ?? "";

    if (!trimmedName || trimmedName.length > 25) {
      return Promise.resolve();
    }

    const errorMessage = validateValue?.(trimmedName);

    if (errorMessage) {
      return Promise.reject(new Error(errorMessage));
    }

    return Promise.resolve();
  }
  return (
    <BaseModal
      open={open}
      title={title}
      onCancel={handleCancel}
      footer={null}
      keepAlive={false}
    >
      <Form
        autoComplete="off"
        form={form}
        layout="vertical"
        initialValues={{
          name: currentValue,
        }}
        onFinish={handleSubmit}
        onFieldsChange={handleFieldsChange}
      >
        <Form.Item
          name="name"
          rules={[
            {
              required: true,
              whitespace: true,
              message: "Введите название",
            },
            {
              max: 25,
              message: "Название не может быть длиннее 25 символов",
            },
            {
              min: 2,
              message: "Название не может быть короче 2 символов",
            },
            {
              validator: customValidate,
            },
          ]}
        >
          <Input
            autoFocus
            placeholder={placeholder}
            onPressEnter={() => {
              if (!isSubmitDisabled) {
                form.submit();
              }
            }}
          />
        </Form.Item>
      </Form>

      <Flex justify="flex-end" gap={8} style={{ marginTop: 24 }}>
        <Button onClick={handleCancel}>Отмена</Button>

        <Button
          type="primary"
          loading={isLoading}
          disabled={isSubmitDisabled}
          onClick={() => form.submit()}
        >
          Да
        </Button>
      </Flex>
    </BaseModal>
  );
}

export default RenameItemModal;
