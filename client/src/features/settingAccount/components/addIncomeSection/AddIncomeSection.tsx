import { useEffect, useState } from "react";
import { Button, DatePicker, Flex, Form, Input } from "antd";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";

import styles from "./AddIncomeSection.module.css";
import { useAccountsStore } from "../../../../store/accountsStore";
import AmountInput from "../../../../shared/components/amountInput/AmountInput";
import { createAccountIncome } from "../../api/createAccountIncome";
import { useProfileStore } from "../../../../store/profileStore";
import type { IncomeItem } from "../accountIncomesSection/AccountIncomesSection";
import { useModalStore } from "../../../../shared/ui/modal";
import { useNavigate } from "react-router-dom";

type AddIncomeFormValues = {
  accountAmount: string;
  incomeName: string;
  incomeDate: Dayjs;
  currencySymbol: string;
  conversionFactor: number;
};

type AddIncomeSectionProps = {
  accountId: string;
  onIncomeCreated: (income: IncomeItem) => void;
};

function AddIncomeSection({
  accountId,
  onIncomeCreated,
}: AddIncomeSectionProps) {
  const [form] = Form.useForm<AddIncomeFormValues>();
  const navigate = useNavigate();
  const accounts = useAccountsStore((store) => store.accounts);
  const updateProfileAmount = useProfileStore(
    (store) => store.updateProfileAmount
  );
  const updateListAmountAccounts = useAccountsStore(
    (store) => store.updateListAmountAccounts
  );
  const currentAccount = accounts.find((account) => account.id === accountId);
  const openModal = useModalStore((state) => state.openModal);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const accountName = currentAccount?.name?.trim();

  const accountTitle = currentAccount
    ? accountName
      ? `«${accountName}»`
      : `${currentAccount.currencySymbol}`
    : "";

  useEffect(() => {
    if (!currentAccount) return;

    form.setFieldsValue({
      accountAmount: "",
      incomeName: "",
      incomeDate: dayjs(),
      currencySymbol: currentAccount.currencySymbol,
      conversionFactor: currentAccount.conversionFactor,
    });
  }, [form, currentAccount?.currencySymbol, currentAccount?.conversionFactor]);

  if (!currentAccount) return null;

  function disabledIncomeDate(currentDate: Dayjs) {
    const todayEnd = dayjs().endOf("day");
    const weekAgoStart = dayjs().subtract(7, "day").startOf("day");

    return currentDate.isAfter(todayEnd) || currentDate.isBefore(weekAgoStart);
  }

  function getIncomeDateTimeForRequest(incomeDate: Dayjs) {
    const now = dayjs();

    return incomeDate
      .hour(now.hour())
      .minute(now.minute())
      .second(now.second())
      .millisecond(now.millisecond())
      .toISOString();
  }

  function handleFieldsChange() {
    const hasErrors = form
      .getFieldsError()
      .some((field) => field.errors.length > 0);

    const values = form.getFieldsValue();

    const nextAmount = values.accountAmount?.trim() ?? "";
    const amountNumber = Number(nextAmount);

    const isEmpty = !nextAmount;
    const isNotNumber = Number.isNaN(amountNumber);
    const isNotPositive = amountNumber <= 0;
    const isDateEmpty = !values.incomeDate;

    setIsSubmitDisabled(
      hasErrors || isEmpty || isNotNumber || isNotPositive || isDateEmpty
    );
  }

  function changeAccountAmmount(newAmount: string, activeAccount: string) {
    updateProfileAmount({ accountId: activeAccount, newAmount });
    updateListAmountAccounts([
      {
        accountId: activeAccount,
        amount: newAmount,
      },
    ]);
  }

  async function handleSubmit(values: AddIncomeFormValues) {
    if (isLoading || isSubmitDisabled) return;

    try {
      setIsLoading(true);

      const incomeDate = getIncomeDateTimeForRequest(values.incomeDate);

      const response = await createAccountIncome({
        accountId,
        amount: String(Number(values.accountAmount) * values.conversionFactor),
        name: values.incomeName?.trim() || null,
        date: incomeDate,
      });

      changeAccountAmmount(
        response.data.account.amount,
        response.data.account.accountId
      );

      form.setFieldsValue({
        accountAmount: "",
        incomeName: "",
        incomeDate: dayjs(),
      });

      onIncomeCreated(response.data.income);

      setIsSubmitDisabled(true);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  function onSubmit(values: AddIncomeFormValues) {
    openModal({
      type: "confirmAction",
      strategy: "destroy",
      props: {
        danger: true,
        title: "Подтвердите пополнение",
        content: `Добавить ${values.accountAmount} ${values.currencySymbol} на счёт ${accountTitle}?`,
        confirmText: "Ок",
        cancelText: "Отмена",
        onConfirm: () => handleSubmit(values),
      },
    });
  }

  function handleClouse() {
    navigate("/app");
  }

  return (
    <section className={styles.section}>
      <Form
        autoComplete="off"
        form={form}
        layout="vertical"
        initialValues={{
          accountAmount: "",
          incomeName: "",
          incomeDate: dayjs(),
          currencySymbol: currentAccount.currencySymbol,
          conversionFactor: currentAccount.conversionFactor,
        }}
        onFinish={onSubmit}
        onFieldsChange={handleFieldsChange}
      >
        <AmountInput required={true} lable="Сумма пополнения" />

        <Form.Item
          name="incomeName"
          label="Название пополнения"
          rules={[
            {
              max: 25,
              message: "Максимум 25 символов",
            },
          ]}
        >
          <Input placeholder="Например, зарплата" disabled={isLoading} />
        </Form.Item>

        <Form.Item
          name="incomeDate"
          label="Дата пополнения"
          rules={[
            {
              required: true,
              message: "Выберите дату пополнения",
            },
          ]}
        >
          <DatePicker
            format="DD.MM.YYYY"
            placeholder="Выберите дату"
            disabled={isLoading}
            disabledDate={disabledIncomeDate}
            style={{ width: "100%" }}
            allowClear={false}
          />
        </Form.Item>

        <Form.Item name="currencySymbol" hidden>
          <input />
        </Form.Item>

        <Form.Item name="conversionFactor" hidden>
          <input />
        </Form.Item>

        <Flex gap="middle">
          <Button block onClick={handleClouse} disabled={isLoading}>
            Назад
          </Button>

          <Button
            block
            type="primary"
            htmlType="submit"
            loading={isLoading}
            disabled={isSubmitDisabled || isLoading}
          >
            Добавить
          </Button>
        </Flex>
      </Form>
    </section>
  );
}

export default AddIncomeSection;
