import styles from "./SpendingsListItemActions.module.css";
import type { SpendingByGroupItem } from "../../../../../../../shared/types/spendings.types";
import DeleteSpendingAction from "../deleteSpendingAction/DeleteSpendingAction";
import RenameSpendingAction from "../renameSpendingAction/RenameSpendingAction";
import ChangeAmonutAction from "../changeAmonutAction/ChangeAmonutAction";

type SpendingsListItemActionsProps = {
  spending: SpendingByGroupItem;
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

function SpendingsListItemActions({
  spending,
  handleRenameSpending,
  handleChangeSpendingAmount,
  handleDeleteSpending,
  isLastSpending,
}: SpendingsListItemActionsProps) {
  return (
    <div className={styles.actions}>
      <RenameSpendingAction
        spending={spending}
        handleRenameSpending={handleRenameSpending}
      />

      <ChangeAmonutAction
        spending={spending}
        handleChangeSpendingAmount={handleChangeSpendingAmount}
      />

      <DeleteSpendingAction
        spending={spending}
        handleDeleteSpending={handleDeleteSpending}
        isLastSpending={isLastSpending}
      />
    </div>
  );
}
export default SpendingsListItemActions;
