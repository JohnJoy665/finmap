import { useEffect, useMemo, useState } from "react";
import { Button, Collapse, Flex, Form, Typography } from "antd";
import type { CollapseProps } from "antd";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

import styles from "./AccountCorrectionSection.module.css";
import { useAccountsStore } from "../../../../store/accountsStore";
import AmountInput from "../../../../shared/components/amountInput/AmountInput";
import { fromMinorToMajorNormalize } from "../../../../utils/toMinorAmount";
import { useModalStore } from "../../../../shared/ui/modal";
import { correctAccountAmount } from "../../api/correctAccountAmount";
import { useProfileStore } from "../../../../store/profileStore";

type AccountCorrectionFormValues = {
  accountAmount: string;
  currencySymbol: string;
  conversionFactor: number;
};

type AccountCorrectionSectionProps = {
  accountId: string;
};

const { Text, Paragraph } = Typography;

function getMinorAmountFromFormValue(
  value: string | undefined,
  conversionFactor: number
) {
  const normalizedValue = String(value ?? "")
    .replace(/[^\d,.-]/g, "")
    .replace(",", ".");

  const amountNumber = Number(normalizedValue);

  if (Number.isNaN(amountNumber)) return null;

  return Math.round(amountNumber * conversionFactor);
}

function AccountCorrectionSection({
  accountId,
}: AccountCorrectionSectionProps) {
  const [form] = Form.useForm<AccountCorrectionFormValues>();
  const navigate = useNavigate();

  const accounts = useAccountsStore((store) => store.accounts);
  const currentAccount = accounts.find((account) => account.id === accountId);

  const [isLoading, setIsLoading] = useState(false);
  const [activeCollapseKeys, setActiveCollapseKeys] = useState<string[]>([]);

  const watchedAccountAmount = Form.useWatch("accountAmount", form);
  const openModal = useModalStore((store) => store.openModal);

  const updateProfileAmount = useProfileStore(
    (state) => state.updateProfileAmount
  );

  const updateListAmountAccounts = useAccountsStore(
    (store) => store.updateListAmountAccounts
  );

  const currentAccountAmount = useMemo(() => {
    if (!currentAccount) return "";

    return fromMinorToMajorNormalize(
      currentAccount.amount,
      currentAccount.conversionFactor
    );
  }, [currentAccount]);

  useEffect(() => {
    if (!currentAccount) return;

    form.setFieldsValue({
      accountAmount: currentAccountAmount,
      currencySymbol: currentAccount.currencySymbol,
      conversionFactor: currentAccount.conversionFactor,
    });
  }, [
    form,
    currentAccountAmount,
    currentAccount?.currencySymbol,
    currentAccount?.conversionFactor,
  ]);

  const isSubmitDisabled = useMemo(() => {
    if (!currentAccount) return true;

    const hasErrors = form
      .getFieldsError()
      .some((field) => field.errors.length > 0);

    const nextAmount = watchedAccountAmount?.trim() ?? "";

    const nextAmountMinor = getMinorAmountFromFormValue(
      nextAmount,
      currentAccount.conversionFactor
    );

    const currentAmountMinor = Number(currentAccount.amount);

    const isEmpty = !nextAmount;
    const isNotNumber = nextAmountMinor === null;
    const isNotChanged = nextAmountMinor === currentAmountMinor;

    return hasErrors || isEmpty || isNotNumber || isNotChanged;
  }, [form, watchedAccountAmount, currentAccount]);

  if (!currentAccount) return null;

  async function handleSubmit(values: AccountCorrectionFormValues) {
    if (isLoading || isSubmitDisabled) return;

    const correctionAmount = getMinorAmountFromFormValue(
      values.accountAmount,
      values.conversionFactor
    );

    if (correctionAmount === null) return;

    try {
      setIsLoading(true);

      // console.log({
      //   accountId,
      //   amount: String(correctionAmount),
      // });

      const response = await correctAccountAmount({
        accountId,
        amount: String(correctionAmount),
      });

      updateProfileAmount({
        accountId: response.data.accountId,
        newAmount: response.data.accountAmount,
      });

      updateListAmountAccounts([
        {
          accountId: response.data.accountId,
          amount: response.data.accountAmount,
        },
      ]);

      form.setFieldsValue({
        accountAmount: currentAccountAmount,
      });

      setActiveCollapseKeys([]);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  function submitClick(values: AccountCorrectionFormValues) {
    openModal({
      type: "confirmAction",
      strategy: "destroy",
      props: {
        danger: true,
        title: `Коррекция баланса`,
        content: `Внимание! Коррекция баланса снижает точность данных и может привести к
              ошибкам в отчетах и аналитике. Вы уверены что хотите измени баланс счета на ${values.accountAmount} ${values.currencySymbol}?`,
        confirmText: "Ок",
        cancelText: "Отмена",
        onConfirm: async () => handleSubmit(values),
      },
    });
  }

  function handleClose() {
    navigate("/app");
  }

  const collapseItems: CollapseProps["items"] = [
    {
      key: "account-correction",
      label: <span className={styles.collapseTitle}>Коррекция баланса</span>,
      classNames: {
        header: styles.rootCollapseHeader,
        body: styles.rootCollapseBody,
      },
      styles: {
        header: {
          padding: 0,
          alignItems: "center",
        },
        body: {
          padding: 0,
        },
      },
      children: (
        <Form
          autoComplete="off"
          form={form}
          layout="vertical"
          initialValues={{
            accountAmount: currentAccountAmount,
            currencySymbol: currentAccount.currencySymbol,
            conversionFactor: currentAccount.conversionFactor,
          }}
          onFinish={submitClick}
          className={styles.form}
        >
          <AmountInput required={true} lable="Сумма коррекции" />

          <Form.Item name="currencySymbol" hidden>
            <input />
          </Form.Item>

          <Form.Item name="conversionFactor" hidden>
            <input />
          </Form.Item>

          <Flex gap="middle">
            <Button block onClick={handleClose} disabled={isLoading}>
              Назад
            </Button>

            <Button
              block
              type="primary"
              htmlType="submit"
              loading={isLoading}
              disabled={isSubmitDisabled || isLoading}
            >
              Записать
            </Button>
          </Flex>

          <Paragraph style={{ marginTop: 16, marginBottom: 0 }}>
            <Text type="secondary">
              * Коррекция баланса снижает точность данных и может привести к
              ошибкам в отчетах и аналитике. Используйте коррекцию баланса
              только в крайнем случае. Для добавления денег на счет используйте
              пополнение.
            </Text>
          </Paragraph>
        </Form>
      ),
    },
  ];

  return (
    <section className={styles.section}>
      <Collapse
        ghost
        bordered={false}
        items={collapseItems}
        activeKey={activeCollapseKeys}
        expandIconPlacement="end"
        className={styles.collapse}
        onChange={(keys) =>
          setActiveCollapseKeys(Array.isArray(keys) ? keys : [keys])
        }
        expandIcon={({ isActive }) =>
          isActive ? (
            <MinusOutlined
              className={styles.collapseIcon}
              style={{
                color: "var(--app-accent)",
                fontSize: 24,
              }}
            />
          ) : (
            <PlusOutlined
              className={styles.collapseIcon}
              style={{
                color: "var(--app-accent)",
                fontSize: 24,
              }}
            />
          )
        }
      />
    </section>
  );
}

export default AccountCorrectionSection;
