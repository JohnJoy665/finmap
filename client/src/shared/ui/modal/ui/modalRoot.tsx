import { modalRegistry } from "../config/modalRegistry";
import { useModalStore } from "../model/modalStore";

function ModalRoot() {
  const stack = useModalStore((state) => state.stack);

  return (
    <>
      {stack.map((modal, index) => {
        const Component = modalRegistry[modal.type];
        const isTopModal = index === stack.length - 1;

        return (
          <Component
            key={modal.id}
            modalId={modal.id}
            open={isTopModal}
            {...modal.props}
          />
        );
      })}
    </>
  );
}

export default ModalRoot;
