export type UserSettingsRow = {
  id: string;
  user_id: string;
  account_id: string;

  language_code: string | null;
  country_code: string | null;
  city_id: number | null;

  visible_account: boolean;
  visible_user_name: boolean;
  visible_group_spendings: boolean;
  visible_average_group_bill: boolean;

  last_check_position: string | null;

  currency_code: string | null;
  country_name: string | null;
  city_name: string | null;
  conversion_factor: number;
  currency_symbol: string | null;
};

export type UserSettings = {
  id: string;
  userId: string;
  accountId: string;

  languageCode: string | null;
  countryCode: string | null;
  cityId: number | null;

  visibleAccount: boolean;
  visibleUserName: boolean;
  visibleGroupSpendings: boolean;
  visibleAverageGroupBill: boolean;

  lastCheckPosition: string | null;

  currencyCode: string | null;
  countryName: string | null;
  cityName: string | null;
  conversionFactor: number;
  currencySymbol: string | null;
};
