export type CreateProfileRequest = {
  languageCode: string;
  countryCode: string;
  countryName: string;
  cityId: number;
  cityName: string;
  currencyCode: string;
  uniqUserName: string;
};

export type GetCitiesRequest = {
  searchString: string;
  langCode: string;
  countryCode: string;
};

export type GetCountriesRequest = {
  searchString: string;
  langCode: string;
};

export type GetCurrenciesRequest = {
  langCode: string;
};

export type GetGeopositionRequest = {
  latitude: number;
  longitude: number;
  langCode: string;
};

export type GetUniqNameRequest = {
  uniqUserName: string;
};
