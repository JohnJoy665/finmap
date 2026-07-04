export type ChangeCurrentAccountResponseData = {
  id: string;
  currencyCode: string;
  amount: string;
  currencySymbol: string;
  conversionFactor: number;
  name: string | null;
};

export type CreateAccountResponseData = {
  id: string;
  currencyCode: string;
  amount: string;
  currencySymbol: string;
  conversionFactor: number;
  name: string | null;
};
