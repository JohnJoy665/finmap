import { Outlet } from "react-router-dom";
import Header from "../../components/layouts/header/Header";
import { Flex } from "antd";
import { useEffect } from "react";
import { getProfileRequest } from "../../api/profileApi";
import { useProfileStore } from "../../store/profileStore";

function WorkspaceLayout() {
  const setProfile = useProfileStore((state) => state.setProfile);

  useEffect(() => {
    async function getProfile() {
      const response = await getProfileRequest();
      setProfile(response.data);
    }

    getProfile();
  }, [setProfile]);

  return (
    <Flex vertical gap={"large"}>
      <Header />
      <Outlet />
    </Flex>
  );
}

export default WorkspaceLayout;
