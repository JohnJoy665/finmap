import { Button, Flex } from "antd";

import AccountInfoSection from "../accountInfoSection/AccountInfoSection";
import styles from "./ContainerSettingAccount.module.css";
import AccountIncomesSection from "../accountIncomesSection/AccountIncomesSection";
import AccountCorrectionSection from "../accountCorrectionSection/AccountCorrectionSection";
import { useNavigate } from "react-router-dom";

type ContainerSettingAccountProps = {
  accountId: string;
};

function ContainerSettingAccount({ accountId }: ContainerSettingAccountProps) {
  const navigate = useNavigate();
  function handleClose() {
    navigate("/app");
  }

  return (
    <Flex vertical className={styles.container}>
      <AccountInfoSection
        key={`account-info-${accountId}`}
        accountId={accountId}
      />

      <AccountIncomesSection
        key={`account-incomes-${accountId}`}
        accountId={accountId}
      />

      <AccountCorrectionSection
        key={`account-correction-${accountId}`}
        accountId={accountId}
      />

      <Flex gap="middle">
        <Button block onClick={handleClose}>
          Назад
        </Button>
      </Flex>
    </Flex>
  );
}

export default ContainerSettingAccount;
