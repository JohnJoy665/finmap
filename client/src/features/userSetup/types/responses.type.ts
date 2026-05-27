export type CreateProfileResponseData = {
  userSettingsId: string;
};

export type GetCitiesResponse = {
  cityId: number;
  cityName: string;
};

export type GetCountriesResponse = {
  countryName: string;
  countryCode?: string;
  countryId?: number;
};

export type GetCurrenciesResponse = {
  currencyName: string;
  currencyCode: string;
  currencySymbol: string;
  conversionFactor: number;
};

export type GetGeopositionResponse = {
  cityId: number;
  countryCode: string;
  cityLocalName: string | null;
  cityInternationalName: string | null;
  featureCode: string;
  population: number | null;
  countryName: string;
  countryId: number;
};

export type GetLanguagesResponse = {
  id: number;
  code: string;
  nameOriginal: string;
};

export type GetUniqNameResponse = {
  uniqUserName: string;
  isAvailable: boolean;
};
