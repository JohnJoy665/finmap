export type SpendingByGroupItem = {
  id: string;
  date: string;
  time: string;
  amount: string;
  conversion_factor: number;
  currencySymbol: string;
  title?: string | null;
  category_code: string | null;
};
