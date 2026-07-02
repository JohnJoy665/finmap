import { useEffect, useState } from "react";
import { Button, Flex, Form, Input, Typography } from "antd";

import styles from "./AccountInfoSection.module.css";
import { useAccountsStore } from "../../../../store/accountsStore";
import { fromMinorToMajorNormalize } from "../../../../utils/toMinorAmount";
import { updateAccountName } from "../../api/updateAccountName";
import { useProfileStore } from "../../../../store/profileStore";

const { Text } = Typography;

type AccountInfoFormValues = {
  accountName: string;
};

type AccountInfoSectionProps = {
  accountId: string;
};

function AccountInfoSection({ accountId }: AccountInfoSectionProps) {
  const [form] = Form.useForm<AccountInfoFormValues>();

  const accounts = useAccountsStore((store) => store.accounts);
  const updateNameAccount = useAccountsStore(
    (store) => store.updateNameAccount
  );

  const updateProfileAccountName = useProfileStore(
    (store) => store.updateProfileAccountName
  );
  const currentAccount = accounts.find((account) => account.id === accountId);

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  useEffect(() => {
    if (!currentAccount) return;

    form.setFieldsValue({
      accountName: currentAccount.name ?? "",
    });
  }, [form, currentAccount?.name]);

  if (!currentAccount) return null;

  const formattedAmount = fromMinorToMajorNormalize(
    currentAccount.amount,
    currentAccount.conversionFactor
  );

  function handleFieldsChange() {
    const hasErrors = form
      .getFieldsError()
      .some((field) => field.errors.length > 0);

    const values = form.getFieldsValue();

    const nextAccountName = values.accountName?.trim() ?? "";
    const initialAccountName = currentAccount.name?.trim() ?? "";

    const isEmpty = !nextAccountName;
    const isNotChanged = nextAccountName === initialAccountName;

    setIsSubmitDisabled(hasErrors || isEmpty || isNotChanged);
  }

  async function handleSubmit(values: AccountInfoFormValues) {
    if (isLoading || isSubmitDisabled) return;

    const normalizedAccountName = values.accountName.trim();

    try {
      setIsLoading(true);

      const response = await updateAccountName({
        accountId,
        name: normalizedAccountName,
      });

      form.setFieldsValue({
        accountName: response.data.name,
      });

      setIsSubmitDisabled(true);
      updateNameAccount({ accountId, name: response.data.name });
      updateProfileAccountName({ accountId, name: response.data.name });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleBack() {
    console.log("back");
  }

  return (
    <section className={styles.section}>
      <div className={styles.balanceBlock}>
        <Text className={styles.balanceLabel}>Баланс счета</Text>

        <div className={styles.balanceValue}>
          <Text className={styles.balanceAmount}>{formattedAmount}</Text>

          <Text className={styles.currencyText}>
            {currentAccount.currencySymbol === currentAccount.currencyCode
              ? currentAccount.currencyCode
              : `${currentAccount.currencySymbol} ${currentAccount.currencyCode}`}
          </Text>
        </div>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          accountName: currentAccount.name ?? "",
        }}
        onFinish={handleSubmit}
        onFieldsChange={handleFieldsChange}
        className={styles.form}
      >
        <Form.Item
          name="accountName"
          label="Название счета"
          rules={[
            {
              max: 50,
              message: "Максимум 50 символов",
            },
          ]}
        >
          <Input placeholder="Введите название счета" disabled={isLoading} />
        </Form.Item>

        <Flex gap="middle">
          <Button block onClick={handleBack} disabled={isLoading}>
            Назад
          </Button>

          <Button
            block
            type="primary"
            htmlType="submit"
            loading={isLoading}
            disabled={isSubmitDisabled || isLoading}
          >
            Сохранить
          </Button>
        </Flex>
      </Form>
    </section>
  );
}

export default AccountInfoSection;
