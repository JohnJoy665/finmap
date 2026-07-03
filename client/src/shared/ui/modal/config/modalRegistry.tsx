import type { ReactNode } from "react";

import type { AppModalItem } from "../model/modal.types";
import ConfirmActionModal from "../modals/ConfirmActionModal";
import RenameItemModal from "../modals/RenameItemModal";
import ChangeAmountModal from "../modals/ChangeAmountModal";
import ChangeLocationModal from "../modals/ChangeLocationModal";
import SetAccountCurrentAmountModal from "../modals/SetAccountCurrentAmountModal";

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

  renameItem: (modal, commonProps) => (
    <RenameItemModal {...commonProps} {...modal.props} />
  ),

  changeAmount: (modal, commonProps) => (
    <ChangeAmountModal {...commonProps} {...modal.props} />
  ),

  changeLocation: (modal, commonProps) => (
    <ChangeLocationModal {...commonProps} {...modal.props} />
  ),
  setAccountCurrentAmount: (modal, commonProps) => (
    <SetAccountCurrentAmountModal {...commonProps} {...modal.props} />
  ),
} satisfies ModalRendererMap;
