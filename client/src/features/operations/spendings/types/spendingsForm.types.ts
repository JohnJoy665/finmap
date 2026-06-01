export type SpendingsFormGroup = {
  groupName: string;
  groupId: string;
};

export type SpendingsFormCategory = {
  categoryName: string;
  categoryId: string;
};

export type SpendingFormValues = {
  amount: string;
  category?: number;
  groupName?: string;
};
