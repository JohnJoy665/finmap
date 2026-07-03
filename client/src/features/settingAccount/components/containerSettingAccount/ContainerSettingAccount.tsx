import { Divider, Flex } from "antd";

import AccountInfoSection from "../accountInfoSection/AccountInfoSection";
import styles from "./ContainerSettingAccount.module.css";
import AccountIncomesSection from "../accountIncomesSection/AccountIncomesSection";

type ContainerSettingAccountProps = {
  accountId: string;
};

function ContainerSettingAccount({ accountId }: ContainerSettingAccountProps) {
  return (
    <Flex vertical className={styles.container}>
      <AccountInfoSection
        key={`account-info-${accountId}`}
        accountId={accountId}
      />

      <Divider className={styles.divider} />

      <AccountIncomesSection
        key={`account-incomes-${accountId}`}
        accountId={accountId}
      />
    </Flex>
  );
}

export default ContainerSettingAccount;
