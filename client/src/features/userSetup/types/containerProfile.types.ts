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

export type Languages = {
  id: number;
  code: string;
  nameOriginal: string;
};
