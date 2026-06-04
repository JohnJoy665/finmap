import type { ReactNode } from "react";

import type { AppModalItem } from "../model/modal.types";
import ConfirmActionModal from "../modals/ConfirmActionModal";
import RenameSpendingModal from "../modals/RenameSpendingModal";
import ChangeAmountModal from "../modals/ChangeAmountModal";

type CommonModalProps = {
  modalId: string;
  open: boolean;
};

type ModalByType<TType extends AppModalItem["type"]> = Extract<
  AppModalItem,
  { type: TType }
>;

type ModalRendererMap = {
  [TType in AppModalItem["type"]]: (
    modal: ModalByType<TType>,
    commonProps: CommonModalProps
  ) => ReactNode;
};

export const modalRegistry = {
  confirmAction: (modal, commonProps) => (
    <ConfirmActionModal {...commonProps} {...modal.props} />
  ),

  renameSpending: (modal, commonProps) => (
    <RenameSpendingModal {...commonProps} {...modal.props} />
  ),

  changeSpendingAmount: (modal, commonProps) => (
    <ChangeAmountModal {...commonProps} {...modal.props} />
  ),
} satisfies ModalRendererMap;
