import { getCurrencies } from "../../api/getCurrencies";
import { getGeoposition } from "../../api/getGeoPosition";
import { getLanguages } from "../../api/getLanguages";
import { useEffect, useState } from "react";
import ProfileForm from "../profileForm/ProfileForm";
import type {
  Currency,
  GeoPosition,
  Languages,
} from "../../types/containerProfile.types";

function ContainerProfile() {
  const [languages, setLanguages] = useState<Languages[]>([]);
  const [selectedLanguageCode, setSelectedLanguageCode] = useState<
    string | null
  >(null);

  const [suggestedGeo, setSuggestedGeo] = useState<
    GeoPosition | undefined | null
  >(undefined);

  const [currencies, setCurrencies] = useState<Currency[] | undefined>(
    undefined
  );

  useEffect(() => {
    async function getLanguagesData() {
      const languagesResponse = await getLanguages();

      const languagesData = languagesResponse.data;

      setLanguages(languagesData);

      const suggestedLang = (
        navigator.languages?.[0] ||
        navigator.language ||
        "en"
      )
        .split("-")[0]
        .toLowerCase();

      const confirmedLanguage = languagesData.some(
        (lang) => lang.code === suggestedLang
      )
        ? suggestedLang
        : null;

      setSelectedLanguageCode(confirmedLanguage);
    }

    getLanguagesData();
  }, []);

  useEffect(() => {
    if (selectedLanguageCode === null || selectedLanguageCode === undefined)
      return;

    const langCode = selectedLanguageCode;

    async function getGeoPositions() {
      setSuggestedGeo(undefined);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const geo = await getGeoposition({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            langCode,
          });

          setSuggestedGeo(geo.data);
        },
        () => {
          setSuggestedGeo(null);
        },
        {
          timeout: 10000,
        }
      );
    }

    async function getCurencies() {
      try {
        const currencies = await getCurrencies({
          langCode,
        });
        setCurrencies(currencies.data);
      } catch {
        setCurrencies(undefined);
      }
    }

    getGeoPositions();
    getCurencies();
  }, [selectedLanguageCode]);

  if (
    languages.length === 0 ||
    suggestedGeo === undefined ||
    currencies === undefined
  )
    return;
  return (
    <ProfileForm
      key={selectedLanguageCode}
      languages={languages}
      languageCode={selectedLanguageCode || ""}
      setSelectedLanguageCode={setSelectedLanguageCode}
      countryCode={suggestedGeo?.countryCode}
      countryName={suggestedGeo?.countryName}
      cityId={suggestedGeo?.cityId}
      cityName={
        suggestedGeo?.cityLocalName ?? suggestedGeo?.cityInternationalName
      }
      currencies={currencies}
    />
  );
}

export default ContainerProfile;
