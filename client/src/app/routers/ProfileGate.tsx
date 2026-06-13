import { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useProfileStore } from "../../store/profileStore";
import { getProfileRequest, updateProfileTimezone } from "../../api/profileApi";
import ProfileEnvironmentWatcher from "./ProfileEnvironmentWatcher";

function ProfileGate() {
  const location = useLocation();

  const setProfile = useProfileStore((state) => state.setProfile);
  const setupRequired = useProfileStore((state) => state.setupRequired);
  const lastCheckPosition = useProfileStore(
    (state) => state.settings?.lastCheckPosition ?? null
  );
  const languageCode = useProfileStore((state) => state.settings?.languageCode);

  useEffect(() => {
    if (setupRequired !== null) return;

    async function getProfile() {
      const response = await getProfileRequest();
      const profile = response.data;

      const settings = profile.settings ?? null;

      if (!settings) {
        setProfile({
          ...profile,
          settings: null,
        });

        return;
      }

      const browserTimezone =
        Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

      if (settings.timezone !== browserTimezone) {
        const timezoneResponse = await updateProfileTimezone(browserTimezone);

        setProfile({
          ...profile,
          settings: {
            ...settings,
            timezone: timezoneResponse.data.timezone,
          },
        });

        return;
      }

      setProfile({
        ...profile,
        settings,
      });
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
      {!setupRequired && languageCode && (
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
