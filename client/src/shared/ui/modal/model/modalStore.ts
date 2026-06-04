import { create } from "zustand";
import type { AppModalItem } from "./modal.types";
import { nanoid } from "nanoid";

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown
  ? Omit<T, K>
  : never;

type OpenModalPayload = DistributiveOmit<AppModalItem, "id">;

type ModalStore = {
  stack: AppModalItem[];

  openModal: (modal: OpenModalPayload) => string;
  closeTopModal: () => void;
  closeAllModals: () => void;
  closeModalById: (id: string) => void;
  replaceModal: (modal: OpenModalPayload) => string;
};

function createModalId() {
  return nanoid();
}

export const useModalStore = create<ModalStore>((set) => ({
  stack: [],

  openModal: (modal) => {
    const id = createModalId();

    const newModal: AppModalItem = {
      ...modal,
      id,
    };

    set((state) => ({
      ...state,
      stack: [...state.stack, newModal],
    }));

    return id;
  },

  closeTopModal: () => {
    set((state) => ({
      ...state,
      stack: state.stack.slice(0, -1),
    }));
  },

  closeAllModals: () => {
    set((state) => ({
      ...state,
      stack: [],
    }));
  },

  closeModalById: (id) => {
    set((state) => ({
      ...state,
      stack: state.stack.filter((modal) => modal.id !== id),
    }));
  },

  replaceModal: (modal) => {
    const id = createModalId();

    const newModal: AppModalItem = {
      ...modal,
      id,
    };

    set((state) => ({
      ...state,
      stack: [...state.stack.slice(0, -1), newModal],
    }));

    return id;
  },
}));
