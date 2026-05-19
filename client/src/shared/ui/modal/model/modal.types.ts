import type { ReactNode } from "react";

export type ModalType = "confirmAction";

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

export type AppModalItem = ConfirmActionModalItem;
