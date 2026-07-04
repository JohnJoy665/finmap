import { useEffect, useMemo, useState } from "react";
import { Button, Collapse, Flex, Form, Input, Typography } from "antd";
import type { CollapseProps } from "antd";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";

import styles from "./AccountInfoSection.module.css";
import { useAccountsStore } from "../../../../store/accountsStore";
import { fromMinorToMajorNormalize } from "../../../../utils/toMinorAmount";
import { updateAccountName } from "../../api/updateAccountName";
import { useProfileStore } from "../../../../store/profileStore";
import { useNavigate } from "react-router-dom";

const { Text } = Typography;

type AccountInfoFormValues = {
  accountName: string;
};

type AccountInfoSectionProps = {
  accountId: string;
};

function AccountInfoSection({ accountId }: AccountInfoSectionProps) {
  const [form] = Form.useForm<AccountInfoFormValues>();
  const navigate = useNavigate();
  const accounts = useAccountsStore((store) => store.accounts);
  const updateNameAccount = useAccountsStore(
    (store) => store.updateNameAccount
  );

  const updateProfileAccountName = useProfileStore(
    (store) => store.updateProfileAccountName
  );

  const currentAccount = accounts.find((account) => account.id === accountId);

  const [isLoading, setIsLoading] = useState(false);
  const [activeCollapseKeys, setActiveCollapseKeys] = useState<string[]>([]);

  const watchedAccountName = Form.useWatch("accountName", form);

  useEffect(() => {
    if (!currentAccount) return;

    form.setFieldsValue({
      accountName: currentAccount.name ?? "",
    });
  }, [form, currentAccount?.name]);

  const isSubmitDisabled = useMemo(() => {
    if (!currentAccount) return true;

    const hasErrors = form
      .getFieldsError()
      .some((field) => field.errors.length > 0);

    const nextAccountName = watchedAccountName?.trim() ?? "";
    const initialAccountName = currentAccount.name?.trim() ?? "";

    const isEmpty = !nextAccountName;
    const isNotChanged = nextAccountName === initialAccountName;

    return hasErrors || isEmpty || isNotChanged;
  }, [form, watchedAccountName, currentAccount]);

  if (!currentAccount) return null;

  const formattedAmount = fromMinorToMajorNormalize(
    currentAccount.amount,
    currentAccount.conversionFactor
  );

  const accountName = currentAccount.name?.trim() || "Без названия";

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

      setActiveCollapseKeys([]);

      updateNameAccount({ accountId, name: response.data.name });
      updateProfileAccountName({ accountId, name: response.data.name });
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  }

  function handleClouse() {
    navigate("/app");
  }

  const collapseItems: CollapseProps["items"] = [
    {
      key: "change-account-name",
      label: <span className={styles.collapseTitle}>Изменить название</span>,
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
          form={form}
          layout="vertical"
          initialValues={{
            accountName: currentAccount.name ?? "",
          }}
          onFinish={handleSubmit}
          className={styles.form}
        >
          <Form.Item
            name="accountName"
            label="Название счета"
            rules={[
              {
                max: 25,
                message: "Максимум 25 символов",
              },
            ]}
          >
            <Input placeholder="Введите название счета" disabled={isLoading} />
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
              Сохранить
            </Button>
          </Flex>
        </Form>
      ),
    },
  ];

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

        <Text
          style={{
            color: "var(--app-accent)",
          }}
          className={styles.accountName}
        >
          {accountName}
        </Text>
      </div>

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

export default AccountInfoSection;
