import ChangeAmountModal from "../modals/ChangeAmountModal";
import ConfirmActionModal from "../modals/ConfirmActionModal";
import RenameSpendingModal from "../modals/RenameSpendingModal";

export const modalRegistry = {
  confirmAction: ConfirmActionModal,
  renameSpending: RenameSpendingModal,
  changeSpendingAmount: ChangeAmountModal,
};
