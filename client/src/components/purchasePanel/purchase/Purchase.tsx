import { useLocation } from "react-router-dom";
import PurchaseForm from "../purchaseForm/PurchaseForm";
import type { Group } from "../../../types/groups.type";

function Purchase() {
  const { state } = useLocation();

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