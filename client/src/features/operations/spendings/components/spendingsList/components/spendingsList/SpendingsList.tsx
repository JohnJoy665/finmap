import { Collapse } from "antd";
import { DownOutlined } from "@ant-design/icons";
import SpendingsListItem from "../spendingsListItem/SpendingsListItem";
import styles from "./SpendingsList.module.css";
import type { SpendingByGroupItem } from "../../../../../../../shared/types/spendings,types";
import SpendingsListItemActions from "../spendingsListItemActions/SpendingsListItemActions";

type SpendingsListProps = {
  spendings: SpendingByGroupItem[];
  handleRenameSpending: (spendingId: string, newName: string) => void;
  handleChangeSpendingAmount: (
    spendingId: string,
    newAmountSpending: string,
    accountId: string,
    newAccountSpending: string
  ) => void;
  handleDeleteSpending: (
    spendingId: string,
    accountId: string,
    accountAmount: string
  ) => void;
  isLastSpending: boolean;
};

function SpendingsList({
  spendings,
  handleRenameSpending,
  handleChangeSpendingAmount,
  handleDeleteSpending,
  isLastSpending,
}: SpendingsListProps) {
  return (
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
      items={spendings.map((spending) => ({
        key: spending.id,
        className: styles.item,
        label: <SpendingsListItem spending={spending} />,
        children: (
          <SpendingsListItemActions
            key={spending.id}
            spending={spending}
            handleRenameSpending={handleRenameSpending}
            handleChangeSpendingAmount={handleChangeSpendingAmount}
            handleDeleteSpending={handleDeleteSpending}
            isLastSpending={isLastSpending}
          />
        ),
      }))}
    />
  );
}

export default SpendingsList;
