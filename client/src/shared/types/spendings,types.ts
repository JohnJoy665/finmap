export type SpendingByGroupItem = {
  id: string;
  date: string;
  time: string;
  amount: string;
  conversionFactor: number;
  currencySymbol: string;
  title?: string | null;
  categoryCode: string | null;
  currencyCode: string;
};
