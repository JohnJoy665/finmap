import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useProfileStore } from "../../store/profileStore";
import { getProfileRequest } from "../../api/profileApi";
import ProfileEnvironmentWatcher from "./ProfileEnvironmentWatcher";

function ProfileGate() {
  const location = useLocation();

  const setProfile = useProfileStore((state) => state.setProfile);
  const setupRequired = useProfileStore((state) => state.setupRequired);

  const settings = useProfileStore((state) => state.settings);

  useEffect(() => {
    if (setupRequired !== null) return;

    async function getProfile() {
      try {
        const response = await getProfileRequest();
        setProfile(response.data);
      } catch (error) {
        console.error("Profile loading failed", error);
      }
    }

    void getProfile();
  }, [setProfile, setupRequired]);

  if (setupRequired === null) {
    return null;
  }

  const isUserSetupPage = location.pathname === "/app/user-setup";

  if (setupRequired && !isUserSetupPage) {
    return <Navigate to="/app/user-setup" replace />;
  }

  if (!setupRequired && isUserSetupPage) {
    return <Navigate to="/app/operations" replace />;
  }

  return (
    <>
      {!setupRequired && settings?.languageCode && (
        <ProfileEnvironmentWatcher
          profileTimezone={settings.timezone}
          languageCode={settings.languageCode}
        />
      )}

      <Outlet />
    </>
  );
}

export default ProfileGate;
