import { create } from "zustand";
import type { AppModalItem } from "./modal.types";
import { nanoid } from "nanoid";

type OpenModalPayload = Omit<AppModalItem, "id">;

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

    set((state) => ({
      stack: [
        ...state.stack,
        {
          ...modal,
          id,
        },
      ],
    }));

    return id;
  },

  closeTopModal: () => {
    set((state) => ({
      stack: state.stack.slice(0, -1),
    }));
  },

  closeAllModals: () => {
    set({ stack: [] });
  },

  closeModalById: (id) => {
    set((state) => ({
      stack: state.stack.filter((modal) => modal.id !== id),
    }));
  },

  replaceModal: (modal) => {
    const id = createModalId();

    set((state) => ({
      stack: [
        ...state.stack.slice(0, -1),
        {
          ...modal,
          id,
        },
      ],
    }));

    return id;
  },
}));
