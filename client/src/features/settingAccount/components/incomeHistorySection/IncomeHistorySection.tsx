import { Collapse, Flex, Typography } from "antd";
import { DownOutlined } from "@ant-design/icons";

import type { IncomeItem } from "../accountIncomesSection/AccountIncomesSection";

import styles from "./IncomeHistorySection.module.css";
import IncomeHistoryListItem from "../incomeHistoryListItem/IncomeHistoryListItem";
import IncomeHistoryListItemActions from "../incomeHistoryListItemActions/IncomeHistoryListItemActions";

type IncomeHistorySectionProps = {
  incomes: IncomeItem[];
  handleRenameIncome: (IncomeId: string, newName: string) => void;
  handleChangeIncomeAmount: (
    incomeId: string,
    newIncomeAmount: string,
    accountId: string,
    newAccountAmount: string
  ) => void;
  handleDeleteIncome: (
    incomeId: string,
    accountId: string,
    accountAmount: string
  ) => void;
};
const { Text } = Typography;
function IncomeHistorySection({
  incomes,
  handleRenameIncome,
  handleChangeIncomeAmount,
  handleDeleteIncome,
}: IncomeHistorySectionProps) {
  return (
    <Flex vertical>
      <Text strong className={styles.title}>
        Последние пополнения
      </Text>
      <Collapse
        accordion
        ghost
        bordered={false}
        expandIconPlacement="end"
        className={styles.collapse}
        expandIcon={({ isActive }) => (
          <DownOutlined
            className={`${styles.arrow} ${isActive ? styles.arrowActive : ""}`}
          />
        )}
        items={incomes.map((income) => ({
          key: income.id,
          className: styles.item,
          label: <IncomeHistoryListItem income={income} />,
          children: (
            <IncomeHistoryListItemActions
              handleRenameIncome={handleRenameIncome}
              handleChangeIncomeAmount={handleChangeIncomeAmount}
              handleDeleteIncome={handleDeleteIncome}
              key={income.id}
              income={income}
            />
          ),
        }))}
      />
    </Flex>
  );
}

export default IncomeHistorySection;
