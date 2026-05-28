import { Typography } from "antd";
import ContainerProfile from "../../features/userSetup/components/containerProfile/ContainerProfile";

function UserSetupPage() {
  return (
    <>
      <Typography.Title level={2}>Заполните профиль</Typography.Title>
      <ContainerProfile />
    </>
  );
}

export default UserSetupPage;
