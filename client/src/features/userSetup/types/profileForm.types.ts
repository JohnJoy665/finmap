export type ProfileFormValues = {
  languageCode?: string;
  countryName?: string;
  cityName?: string;
  countryCode?: string;
  cityId?: number;
  currencyName?: string;
  currencyCode: string;
  uniqUserName?: string;
};

export type City = {
  cityId: number;
  cityName: string;
};

export type Country = {
  countryName: string;
  countryCode?: string;
  countryId?: number;
};
