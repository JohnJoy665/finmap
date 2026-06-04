import { modalRegistry } from "../config/modalRegistry";
import { useModalStore } from "../model/modalStore";
import type { AppModalItem } from "../model/modal.types";

type CommonModalProps = {
  modalId: string;
  open: boolean;
};

function getModalRenderer<TModal extends AppModalItem>(modal: TModal) {
  return modalRegistry[modal.type] as (
    modal: TModal,
    commonProps: CommonModalProps
  ) => React.ReactNode;
}

function ModalRoot() {
  const stack = useModalStore((state) => state.stack);

  return (
    <>
      {stack.map((modal, index) => {
        const isTopModal = index === stack.length - 1;
        const renderModal = getModalRenderer(modal);

        return (
          <div key={modal.id}>
            {renderModal(modal, {
              modalId: modal.id,
              open: isTopModal,
            })}
          </div>
        );
      })}
    </>
  );
}

export default ModalRoot;
