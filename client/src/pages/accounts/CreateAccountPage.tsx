import { Typography } from "antd";
import ContainerCreateAccount from "../../features/createAccount/components/containerCreateAccount/ContainerCreateAccount";

function CreateAccountPage() {
  return (
    <>
      <Typography.Title level={2}>Добавьте счет</Typography.Title>
      <ContainerCreateAccount />
    </>
  );
}

export default CreateAccountPage;
