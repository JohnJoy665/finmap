import { useEffect, useState } from "react";
import { getLanguagesRequest } from "../../features/userSetup/api/getLanguages";
import type { Languages } from "../../features/userSetup/api/getLanguages";
import { postGeoposition } from "../../features/userSetup/api/getGeoPosition";
import ProfileForm from "../../features/userSetup/components/ProfileForm";
import { getCurrencies } from "../../features/userSetup/api/getCurrencies";

export type GeoPosition = {
  cityId: number;
  countryCode: string;
  cityLocalName: string | null;
  cityInternationalName: string | null;
  featureCode: string;
  population: number | null;
  countryName: string;
  countryId: number;
};

export type Currency = {
  currencyName: string;
  currencyCode: string;
  currencySymbol: string;
  conversionFactor: number;
};

function UserSetupPage() {
  const [languages, setLanguages] = useState<Languages[]>([]);
  const [selectedLanguageCode, setSelectedLanguageCode] = useState<
    string | null
  >(null);

  const [sugestedGeo, setSugestedGeo] = useState<
    GeoPosition | undefined | null
  >(undefined);

  const [currencies, setCurrencies] = useState<Currency[] | undefined>(
    undefined
  );

  useEffect(() => {
    async function getLanguages() {
      const languagesResponse = await getLanguagesRequest();

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

    getLanguages();
  }, []);

  useEffect(() => {
    console.log("selectedLanguageCode = ", selectedLanguageCode);

    if (selectedLanguageCode === null || selectedLanguageCode === undefined)
      return;

    async function getGeoPositions() {
      try {
        setSugestedGeo(undefined);

        navigator.geolocation.getCurrentPosition(async (position) => {
          try {
            const geo = await postGeoposition({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              langCode: selectedLanguageCode,
            });

            setSugestedGeo(geo.data);
          } catch (error) {
            console.log(error);
          }
        });
      } catch (error) {
        console.log(error);
      }
    }

    async function getCurencies() {
      try {
        const currencies = await getCurrencies({
          langCode: selectedLanguageCode,
        });
        setCurrencies(currencies.data);
      } catch (error) {
        console.log(error);
        setCurrencies(undefined);
      }
    }

    getGeoPositions();
    getCurencies();
  }, [selectedLanguageCode]);

  if (
    languages.length === 0 ||
    sugestedGeo === undefined ||
    currencies === undefined
  )
    return;

  return (
    <ProfileForm
      key={selectedLanguageCode}
      languages={languages}
      languageCode={selectedLanguageCode ?? null}
      setSelectedLanguageCode={setSelectedLanguageCode}
      countryCode={sugestedGeo?.countryCode}
      countryName={sugestedGeo?.countryName}
      cityId={sugestedGeo?.cityId}
      cityName={
        sugestedGeo?.cityLocalName ?? sugestedGeo?.cityInternationalName
      }
      currencies={currencies}
    />
  );
}

export default UserSetupPage;
