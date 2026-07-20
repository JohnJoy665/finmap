import { Button, Flex, Form } from "antd";
import { useState } from "react";

import type { SetAccountCurrentAmountModalProps } from "../model/modal.types";
import { useModalStore } from "../model/modalStore";
import BaseModal from "../ui/BaseModal";
import AmountInput from "../../../components/amountInput/AmountInput";

type CurrentAmountFormValues = {
  currencySymbol: string;
  accountAmount: string;
};

type Props = SetAccountCurrentAmountModalProps & {
  modalId: string;
  open: boolean;
};

function SetAccountCurrentAmountModal({
  modalId,
  open,
  accountId,
  onSubmit,
  onCancel,
  conversionFactor,
  currencySymbol,
  currencyCode,
}: Props) {
  const [form] = Form.useForm<CurrentAmountFormValues>();
  const closeModalById = useModalStore((store) => store.closeModalById);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  const [isLoading, setIsLoading] = useState(false);

  function handleCancel() {
    onCancel?.();
    closeModalById(modalId);
  }

  function handleFieldsChange() {
    const hasErrors = form
      .getFieldsError()
      .some((field) => field.errors.length > 0);

    const values = form.getFieldsValue();

    const nextAmount = values.accountAmount?.trim();

    const isEmpty = !nextAmount;
    const isNull = Number(nextAmount) === 0;

    setIsSubmitDisabled(hasErrors || isEmpty || isNull);
  }

  async function handleSubmit(values: CurrentAmountFormValues) {
    try {
      setIsLoading(true);

      await onSubmit({
        accountId,
        amount: values.accountAmount,
      });

      closeModalById(modalId);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <BaseModal
      open={open}
      title={`Укажите текущий баланс счёта ${currencySymbol || currencyCode}`}
      onCancel={handleCancel}
      footer={null}
      keepAlive={false}
    >
      <Form
        autoComplete="off"
        form={form}
        layout="vertical"
        initialValues={{
          currencySymbol,
          accountAmount: 0,
          conversionFactor,
        }}
        onFinish={handleSubmit}
        onFieldsChange={handleFieldsChange}
      >
        <AmountInput lable="Чтобы настроить счёт и видеть аналитику, укажите, сколько денег сейчас находится на этом счёте." />

        <Form.Item name="currencySymbol" hidden>
          <input />
        </Form.Item>

        <Form.Item name="conversionFactor" hidden>
          <input />
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

export default SetAccountCurrentAmountModal;
