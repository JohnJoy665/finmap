// shared/ui/modal/index.ts

export { default as ModalRoot } from "./ui/modalRoot";
export { useModalStore } from "./model/modalStore";

export type {
  ModalType,
  ModalStrategy,
  ModalItem,
  ConfirmActionModalProps,
  ConfirmActionModalItem,
  AppModalItem,
} from "./model/modal.types";
