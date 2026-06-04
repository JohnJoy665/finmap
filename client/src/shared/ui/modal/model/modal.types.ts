import type { ReactNode } from "react";

export type ModalType =
  | "confirmAction"
  | "renameSpending"
  | "changeSpendingAmount";

export type ModalStrategy = "destroy" | "keepAlive";

export type ModalItem<TProps extends object = object> = {
  id: string;
  type: ModalType;
  props: TProps;
  strategy?: ModalStrategy;
};

export type ConfirmActionModalProps = {
  title: ReactNode;
  content?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
};

export type ConfirmActionModalItem = ModalItem<ConfirmActionModalProps> & {
  type: "confirmAction";
};

/////////////////////////////////////////////////

export type RenameSpendingModalProps = {
  spendingId: string;
  currentName: string;
  onRename: (payload: {
    spendingId: string;
    name: string;
  }) => void | Promise<void>;
};

export type RenameSpendingModalItem = ModalItem<RenameSpendingModalProps> & {
  type: "renameSpending";
};

//////////////////////////////////////////////////

export type ChangeSpendingAmountProps = {
  spendingId: string;
  currencySymbol: string;
  accountAmount: string;
  onChangeAmount: (payload: {
    spendingId: string;
    currencySymbol: string;
    spendingAmount: string;
    accountId: string;
    accountAmount: string;
  }) => void | Promise<void>;
};

export type ChangeSpendingAmountModalItem =
  ModalItem<ChangeSpendingAmountProps> & {
    type: "changeSpendingAmount";
  };

export type AppModalItem =
  | ConfirmActionModalItem
  | RenameSpendingModalItem
  | ChangeSpendingAmountModalItem;
