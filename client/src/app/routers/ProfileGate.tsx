import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useProfileStore } from "../../store/profileStore";
import { getProfileRequest } from "../../api/profileApi";
import ProfileEnvironmentWatcher from "./ProfileEnvironmentWatcher";

function ProfileGate() {
  const location = useLocation();

  const setProfile = useProfileStore((state) => state.setProfile);
  const setupRequired = useProfileStore((state) => state.setupRequired);
  const lastCheckPosition = useProfileStore(
    (state) => state.settings?.lastCheckPosition
  );
  const languageCode = useProfileStore((state) => state.settings?.languageCode);

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

  return (
    <>
      {!setupRequired && lastCheckPosition && languageCode && (
        <ProfileEnvironmentWatcher
          lastCheckPosition={lastCheckPosition}
          languageCode={languageCode}
        />
      )}
      <Outlet />
    </>
  );
}

export default ProfileGate;
