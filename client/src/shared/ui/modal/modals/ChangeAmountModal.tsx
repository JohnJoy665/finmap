import { Button, Flex, Form } from "antd";
import { useState } from "react";

import { useModalStore } from "../model/modalStore";
import BaseModal from "../ui/BaseModal";
import AmountInput from "../../../components/amountInput/AmountInput";
import type { ChangeAmountProps } from "../model/modal.types";

type ChangeAmountFormValues = {
  currencySymbol: string;
  accountAmount: string;
};

type Props = ChangeAmountProps & {
  modalId: string;
  open: boolean;
};

function ChangeAmountModal({
  modalId,
  open,
  currencySymbol,
  oldAmount,
  itemId,
  conversionFactor,
  fieldLable,
  title,
  onChangeAmount,
}: Props) {
  const [form] = Form.useForm<ChangeAmountFormValues>();
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

    const values = form.getFieldsValue();

    const nextAmount = values.accountAmount?.trim();
    const initialAmount = oldAmount.trim();

    const isEmpty = !nextAmount;
    const isNotChanged = nextAmount === initialAmount;
    const isNull = Number(nextAmount) === 0;

    setIsSubmitDisabled(hasErrors || isEmpty || isNotChanged || isNull);
  }

  async function handleSubmit(values: ChangeAmountFormValues) {
    try {
      setIsLoading(true);

      await onChangeAmount({
        itemId,
        currencySymbol: values.currencySymbol,
        newAmount: values.accountAmount,
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
      <Form
        autoComplete="off"
        form={form}
        layout="vertical"
        initialValues={{
          currencySymbol,
          accountAmount: oldAmount,
          conversionFactor,
        }}
        onFinish={handleSubmit}
        onFieldsChange={handleFieldsChange}
      >
        <AmountInput lable={fieldLable} />

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

export default ChangeAmountModal;
