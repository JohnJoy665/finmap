import type { ReactNode } from "react";

export type ModalType =
  | "confirmAction"
  | "renameItem"
  | "changeAmount"
  | "changeLocation"
  | "setAccountCurrentAmount";

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

export type RenameItemModalProps = {
  itemId: string;
  currentValue: string;
  title: string;
  placeholder: string;
  onRename: (payload: { itemId: string; name: string }) => void | Promise<void>;
};

export type RenameItemModalItem = ModalItem<RenameItemModalProps> & {
  type: "renameItem";
};

//////////////////////////////////////////////////

export type ChangeAmountProps = {
  itemId: string;
  currencySymbol: string;
  oldAmount: string;
  conversionFactor: number;
  fieldLable: string;
  title: string;
  onChangeAmount: (payload: {
    itemId: string;
    currencySymbol: string;
    newAmount: string;
  }) => void | Promise<void>;
};

export type ChangeAmountModalItem = ModalItem<ChangeAmountProps> & {
  type: "changeAmount";
};

///////////////////////////////////////////////////////

export type ChangeLocationModalProps = {
  content: string;
  countryCode: string;
  countryName: string;
  cityId: number;
  cityName: string;
  languageCode: string;
  onChangeLocation: (payload: {
    countryCode: string;
    cityId: number;
  }) => void | Promise<void>;
};

export type ChangeLocationModalItem = ModalItem<ChangeLocationModalProps> & {
  type: "changeLocation";
};

//////////////////////////////////////////////////////

export type SetAccountCurrentAmountModalProps = {
  accountId: string;
  currencySymbol: string;
  conversionFactor: number;
  currencyCode: string;
  onSubmit: (payload: {
    accountId: string;
    amount: string;
  }) => void | Promise<void>;
  onCancel?: () => void;
};

export type SetAccountCurrentAmountModalItem =
  ModalItem<SetAccountCurrentAmountModalProps> & {
    type: "setAccountCurrentAmount";
  };

export type AppModalItem =
  | ConfirmActionModalItem
  | RenameItemModalItem
  | ChangeAmountModalItem
  | ChangeLocationModalItem
  | SetAccountCurrentAmountModalItem;
