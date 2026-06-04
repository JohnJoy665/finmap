import { Button, Flex, Form } from "antd";
import { useState } from "react";

import { useModalStore } from "../model/modalStore";
import BaseModal from "../ui/BaseModal";
import AmountInput from "../../../components/amountInput/AmountInput";
import type { ChangeSpendingAmountProps } from "../model/modal.types";

type ChangeSpendingAmountFormValues = {
  currencySymbol: string;
  accountAmount: string;
};

type Props = ChangeSpendingAmountProps & {
  modalId: string;
  open: boolean;
};

function ChangeAmountModal({
  modalId,
  open,
  currencySymbol,
  accountAmount,
  spendingId,
  onChangeAmount,
}: Props) {
  const [form] = Form.useForm<ChangeSpendingAmountFormValues>();
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
    const initialAmount = accountAmount.trim();

    const isEmpty = !nextAmount;
    const isNotChanged = nextAmount === initialAmount;
    const isNull = Number(nextAmount) === 0;

    setIsSubmitDisabled(hasErrors || isEmpty || isNotChanged || isNull);
  }

  async function handleSubmit(values: ChangeSpendingAmountFormValues) {
    try {
      setIsLoading(true);

      await onChangeAmount({
        spendingId,
        currencySymbol: values.currencySymbol,
        spendingAmount: values.accountAmount,
        accountId: "123",
        accountAmount: values.accountAmount,
      });

      closeModalById(modalId);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <BaseModal
      open={open}
      title="Изменить сумму покупки"
      onCancel={handleCancel}
      footer={null}
      keepAlive={false}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          currencySymbol,
          accountAmount,
        }}
        onFinish={handleSubmit}
        onFieldsChange={handleFieldsChange}
      >
        <AmountInput lable="Сумма покупки" />

        <Form.Item name="currencySymbol" hidden>
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
