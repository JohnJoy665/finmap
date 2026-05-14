import { useLocation } from "react-router-dom";
import PurchaseForm from "../purchaseForm/PurchaseForm";
import type { Group } from "../../../types/groups.type";
import { getCategories } from "../../../api/operationsApi";
import { useEffect } from "react";
import { usePurchaseStore } from "../../../store/purchaseStore";

function Purchase() {
  const { state } = useLocation();
  const setCategories = usePurchaseStore((state) => state.setCategories);

  useEffect(() => {
    async function requestCategories() {
      const categories = await getCategories();
      setCategories(categories.data);
      // console.log(categoriesResponse);
    }

    requestCategories();
  }, []);

  const isNewGroup = state?.mode === "newGroup";
  const group: Group = state?.group;

  return isNewGroup ? (
    <PurchaseForm />
  ) : (
    <PurchaseForm
      group={{
        groupName: group.title,
        groupId: group.id,
        isShowingTemplate: true,
      }}
      category={{
        categoryName: group.category_description,
        categoryId: group.category_id,
        isShowingTemplate: true,
      }}
    />
  );
}

export default Purchase;
