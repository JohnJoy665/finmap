import { useEffect } from "react";
import { checkProfileEnvironment } from "../../features/checkEnvironment/api/checkProfileEnvironmet";
import { useModalStore } from "../../shared/ui/modal";

type ProfileEnvironmentWatcherProps = {
  lastCheckPosition: string;
};

const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000;

function ProfileEnvironmentWatcher({
  lastCheckPosition,
}: ProfileEnvironmentWatcherProps) {
  const openModal = useModalStore((state) => state.openModal);

  function handleUpdateLocal(location) {
    console.log(location);
  }

  useEffect(() => {
    async function getEnvironment() {
      try {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        const diff = Date.now() - new Date(lastCheckPosition).getTime();
        const shouldCheckPosition = diff > CHECK_INTERVAL_MS;

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

        if (environment.data.locationChanged) {
          openModal({
            type: "confirmAction",
            strategy: "destroy",
            props: {
              danger: true,
              title: "Мы обнаружили новую геолокацию",
              content: `Подтвердите, что вы тут: ${environment.data.suggestedLocation.countryName}, ${environment.data.suggestedLocation.cityName}`,
              confirmText: "Ок",
              cancelText: "Отмена",
              onConfirm: () => handleUpdateLocal(environment),
            },
          });
        }
      } catch (error) {
        console.log(error);
      }
    }

    getEnvironment();
  }, [lastCheckPosition]);

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
