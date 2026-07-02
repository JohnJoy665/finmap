import { Divider, Flex } from "antd";

import AccountInfoSection from "../accountInfoSection/AccountInfoSection";
import AddIncomeSection from "../addIncomeSection/AddIncomeSection";
import IncomeHistorySection from "../incomeHistorySection/IncomeHistorySection";
import styles from "./ContainerSettingAccount.module.css";

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

      <AddIncomeSection key={`add-income-${accountId}`} accountId={accountId} />

      <Divider className={styles.divider} />

      <IncomeHistorySection />
    </Flex>
  );
}

export default ContainerSettingAccount;
