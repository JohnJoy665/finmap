import { useLocation } from "react-router-dom";
import SpendingsForm from "../../features/operations/spendings/components/spendingsForm/SpendingsForm";
import { useEffect } from "react";
import { usePurchaseStore } from "../../store/purchaseStore";
import { getCategories } from "../../features/operations/spendings/api/getCategories";
import type { Group } from "../../shared/types/group.types";

function Spendings() {
  const { state } = useLocation();
  const setCategories = usePurchaseStore((state) => state.setCategories);

  useEffect(() => {
    async function requestCategories() {
      const categories = await getCategories();
      setCategories(categories.data);
    }

    requestCategories();
  });

  const isNewGroup = state?.mode === "newGroup";
  const group: Group = state?.group;

  return isNewGroup ? (
    <SpendingsForm />
  ) : (
    <SpendingsForm
      group={{
        groupName: group.title,
        groupId: group.id,
      }}
      category={{
        categoryName: group.category_description,
        categoryId: group.category_id,
      }}
    />
  );
}

export default Spendings;
