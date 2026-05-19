import { Modal, type ModalProps } from "antd";

type BaseModalProps = ModalProps & {
  keepAlive?: boolean;
};

function BaseModal({ keepAlive = false, ...props }: BaseModalProps) {
  return <Modal destroyOnHidden={!keepAlive} centered {...props} />;
}

export default BaseModal;
