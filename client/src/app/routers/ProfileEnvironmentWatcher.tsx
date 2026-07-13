import { useCallback, useEffect, useRef } from "react";
import { checkProfileEnvironment } from "../../features/checkEnvironment/api/checkProfileEnvironmet";
import { changeProfileLocation } from "../../features/checkEnvironment/api/changeProfileLocation";
import { useModalStore } from "../../shared/ui/modal";
import { useProfileStore } from "../../store/profileStore";

type ProfileEnvironmentWatcherProps = {
  profileTimezone: string | null;
  languageCode: string;
};

type ChangeLocationPayload = {
  countryCode: string;
  cityId: number;
};

function ProfileEnvironmentWatcher({
  profileTimezone,
  languageCode,
}: ProfileEnvironmentWatcherProps) {
  const checkStartedRef = useRef(false);

  const openModal = useModalStore((state) => state.openModal);
  const updateLocation = useProfileStore((state) => state.updateLocation);
  const updateTimezone = useProfileStore((state) => state.updateTimezone);

  const handleChangeLocation = useCallback(
    async (value: ChangeLocationPayload) => {
      try {
        const response = await changeProfileLocation({
          countryCode: value.countryCode,
          cityId: value.cityId,
        });

        updateLocation({
          countryCode: response.data.countryCode,
          cityId: response.data.cityId,
        });
      } catch (error) {
        console.error("Location change failed", error);
      }
    },
    [updateLocation]
  );

  useEffect(() => {
    if (checkStartedRef.current) {
      return;
    }

    checkStartedRef.current = true;

    async function checkEnvironment() {
      const browserTimezone =
        Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

      let latitude: number | null = null;
      let longitude: number | null = null;

      try {
        const position = await getCurrentPosition();

        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      } catch (error) {
        console.info("Geolocation is unavailable", error);
      }

      try {
        const response = await checkProfileEnvironment({
          timezone: browserTimezone,
          latitude,
          longitude,
        });

        const environment = response.data;

        if (environment.timezoneUpdated) {
          updateTimezone(browserTimezone);
        }

        const suggestedLocation = environment.suggestedLocation;

        if (!environment.locationChanged || !suggestedLocation) {
          return;
        }

        openModal({
          type: "changeLocation",
          strategy: "destroy",
          props: {
            countryCode: suggestedLocation.countryCode,
            countryName: suggestedLocation.countryName,
            cityId: suggestedLocation.cityId,
            cityName: suggestedLocation.cityName,
            languageCode,
            content: "Подтвердите свою локацию или выберите новую",
            onChangeLocation: handleChangeLocation,
          },
        });
      } catch (error) {
        console.error("Environment check failed", error);
      }
    }

    void checkEnvironment();
  }, [
    profileTimezone,
    languageCode,
    openModal,
    handleChangeLocation,
    updateTimezone,
  ]);

  return null;
}

export default ProfileEnvironmentWatcher;

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: false,
      timeout: 15_000,
      maximumAge: 30 * 60 * 1000,
    });
  });
}
