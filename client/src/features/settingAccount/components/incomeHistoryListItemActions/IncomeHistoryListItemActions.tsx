import styles from "./IncomeHistoryListItemActions.module.css";
import type { IncomeItem } from "../accountIncomesSection/AccountIncomesSection";
import RenameIncomeAction from "../renameIncomeAction/RenameIncomeAction";
import ChangeIncomeAmountAction from "../changeIncomeAmountAction/ChangeIncomeAmountAction";
import DeleteIncomeAction from "../deleteIncomeAction/DeleteIncomeAction";

type IncomeHistoryListItemActionsProps = {
  income: IncomeItem;
  handleRenameIncome: (IncomeId: string, newName: string) => void;
};

function IncomeHistoryListItemActions({
  income,
  handleRenameIncome,
}: IncomeHistoryListItemActionsProps) {
  return (
    <div className={styles.actions}>
      <RenameIncomeAction
        handleRenameIncome={handleRenameIncome}
        income={income}
      />

      <ChangeIncomeAmountAction income={income} />

      <DeleteIncomeAction income={income} />
    </div>
  );
}

export default IncomeHistoryListItemActions;
