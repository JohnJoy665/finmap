import { useLocation, useNavigate } from "react-router-dom";
import SpendingsForm from "../../features/operations/spendings/components/spendingsForm/SpendingsForm";
import { useEffect } from "react";
import { usePurchaseStore } from "../../store/purchaseStore";
import { getCategories } from "../../features/operations/spendings/api/getCategories";
import type { Group } from "../../shared/types/group.types";
import { useProfileStore } from "../../store/profileStore";
import { createNewSpending } from "../../features/operations/spendings/api/createNewSpending";
import type { SpendingFormValues } from "../../features/operations/spendings/types/spendings.types";
import { createNewGroupWithSpending } from "../../features/operations/spendings/api/createNewGroupWithSpending";
import DeleteGroupButton from "../../features/operations/spendings/components/deleteGroupButton/DeleteGroupButton";
import { deleteGroupWithSpending } from "../../features/operations/groups/api/deleteGroupWithSpendings";
import { toMinorUnits } from "../../utils/toMinorAmount";

function SpendingsPage() {
  const { state } = useLocation();
  const setCategories = usePurchaseStore((store) => store.setCategories);

  const group: Group | undefined = state?.group;

  const navigate = useNavigate();

  const updateAccountAmount = useProfileStore(
    (state) => state.updateAccountAmount
  );

  const conversionFactor = useProfileStore(
    (store) => store.account?.conversionFactor
  );

  useEffect(() => {
    async function requestCategories() {
      const categories = await getCategories();
      setCategories(categories.data);
    }

    requestCategories();
  }, [setCategories]);

  function handleCancel() {
    navigate("/app/operations");
  }

  async function handleSubmit(values: SpendingFormValues) {
    if (!conversionFactor) return;
    const minorAmount = toMinorUnits(values.amount, conversionFactor);

    if (group) {
      const newSpending = await createNewSpending({
        amount: minorAmount,
        groupId: group.id,
        categoryId: values.category,
      });

      updateAccountAmount(newSpending.data.accountAmount);
    } else {
      if (!values.groupName) return;

      const newGroup = await createNewGroupWithSpending({
        amount: minorAmount,
        groupName: values.groupName,
        categoryId: values.category,
      });

      updateAccountAmount(newGroup.data.accountAmount);
    }

    handleCancel();
  }

  async function handleGroupDelete(groupId: string) {
    const deletedGoup = await deleteGroupWithSpending(groupId);
    updateAccountAmount(deletedGoup.data.accountAmount);
    handleCancel();
  }

  return (
    <>
      <SpendingsForm
        handleSubmit={handleSubmit}
        handleCancel={handleCancel}
        group={
          group
            ? {
                groupName: group.title,
                groupId: group.id,
              }
            : undefined
        }
        category={
          group
            ? {
                categoryName: group.category_description,
                categoryId: group.category_id,
              }
            : undefined
        }
      />
      {group?.id && (
        <DeleteGroupButton
          groupId={group?.id}
          handleGroupDelete={handleGroupDelete}
        />
      )}
    </>
  );
}

export default SpendingsPage;
