import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useProfileStore } from "../../store/profileStore";
import { getProfileRequest } from "../../api/profileApi";

function ProfileGate() {
  const location = useLocation();

  const setProfile = useProfileStore((state) => state.setProfile);
  const setupRequired = useProfileStore((state) => state.setupRequired);

  useEffect(() => {
    if (setupRequired !== null) return;

    async function getProfile() {
      const response = await getProfileRequest();
      setProfile(response.data);
    }

    getProfile();
  }, [setProfile, setupRequired]);

  if (setupRequired === null) return null;

  const isUserSetupPage = location.pathname === "/app/user-setup";

  if (setupRequired && !isUserSetupPage) {
    return <Navigate to="/app/user-setup" replace />;
  }

  if (!setupRequired && isUserSetupPage) {
    return <Navigate to="/app/operations" replace />;
  }

  return <Outlet />;
}

export default ProfileGate;
