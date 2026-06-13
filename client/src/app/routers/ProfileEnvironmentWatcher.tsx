import { useCallback, useEffect, useRef } from "react";
import { checkProfileEnvironment } from "../../features/checkEnvironment/api/checkProfileEnvironmet";
import { useModalStore } from "../../shared/ui/modal";
import { changeProfileLocation } from "../../features/checkEnvironment/api/changeProfileLocation";
import { useProfileStore } from "../../store/profileStore";

type ProfileEnvironmentWatcherProps = {
  lastCheckPosition: string | null;
  languageCode: string;
};

type ChangeLocationPayload = {
  countryCode: string;
  cityId: number;
};

const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;

function ProfileEnvironmentWatcher({
  lastCheckPosition,
  languageCode,
}: ProfileEnvironmentWatcherProps) {
  const alreadyCheckedRef = useRef(false);

  const openModal = useModalStore((state) => state.openModal);
  const updateLocation = useProfileStore((store) => store.updateLocation);

  const handleChangeLocation = useCallback(
    async (value: ChangeLocationPayload) => {
      try {
        const response = await changeProfileLocation({
          countryCode: value.countryCode,
          cityId: value.cityId,
        });

        const newLocation = response.data;

        updateLocation({
          countryCode: newLocation.countryCode,
          cityId: newLocation.cityId,
        });
      } catch (error) {
        console.log(error);
      }
    },
    [updateLocation]
  );

  useEffect(() => {
    if (alreadyCheckedRef.current) {
      return;
    }

    alreadyCheckedRef.current = true;

    async function getEnvironment() {
      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const shouldCheckPosition =
          !lastCheckPosition ||
          Date.now() - new Date(lastCheckPosition).getTime() >
            CHECK_INTERVAL_MS;

        let latitude: number | null = null;
        let longitude: number | null = null;

        if (shouldCheckPosition) {
          try {
            const position = await getCurrentPosition();

            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
          } catch (error) {
            console.log("Geolocation failed", error);
          }
        }

        const environment = await checkProfileEnvironment({
          timezone,
          latitude,
          longitude,
        });

        const suggestedLocation = environment.data.suggestedLocation;

        if (environment.data.locationChanged && suggestedLocation) {
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
        }
      } catch (error) {
        console.log(error);
      }
    }

    getEnvironment();
  }, [lastCheckPosition, openModal, languageCode, handleChangeLocation]);

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
      timeout: 15000,
      maximumAge: 1000 * 60 * 30,
    });
  });
}
