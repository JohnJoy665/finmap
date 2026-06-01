import { useLocation, useNavigate } from "react-router-dom";
import SpendingsForm from "../../features/operations/spendings/components/spendingsForm/SpendingsForm";
import { useEffect } from "react";
import { usePurchaseStore } from "../../store/purchaseStore";
import { getCategories } from "../../features/operations/spendings/api/getCategories";
import type { Group } from "../../shared/types/group.types";
import { useProfileStore } from "../../store/profileStore";
import { createNewSpending } from "../../features/operations/spendings/api/createNewSpending";
import type { SpendingFormValues } from "../../features/operations/spendings/types/spendingsForm.types";
import { createNewGroupWithSpending } from "../../features/operations/spendings/api/createNewGroupWithSpending";
import DeleteGroupAction from "../../features/operations/spendings/components/deleteGroupAction/DeleteGroupAction";
import { toMinorUnits } from "../../utils/toMinorAmount";
import { useRequestLock } from "../../hooks/useRequestLock";
import { useAccountsStore } from "../../store/accountsStore";

function SpendingsPage() {
  const { state } = useLocation();
  const group: Group | undefined = state?.group;
  const setCategories = usePurchaseStore((store) => store.setCategories);
  const categories = usePurchaseStore((store) => store.categories);
  const navigate = useNavigate();

  const { isSubmitting, withRequestLock } = useRequestLock();

  const updateProfileAmount = useProfileStore(
    (state) => state.updateProfileAmount
  );

  const activeAccount = useProfileStore((state) => state.account?.id);

  const updateListAmountAccounts = useAccountsStore(
    (store) => store.updateListAmountAccounts
  );

  const conversionFactor = useProfileStore(
    (store) => store.account?.conversionFactor
  );

  useEffect(() => {
    async function requestCategories() {
      if (categories.length !== 0) return;
      const categoriesResult = await getCategories();
      setCategories(categoriesResult.data);
    }

    requestCategories();
  }, [setCategories, categories]);

  function handleCancel() {
    navigate("/app/operations");
  }

  function changeAccountAmmount(newAmmount: string, activeAccount: string) {
    updateProfileAmount(newAmmount);
    updateListAmountAccounts([
      {
        accountId: activeAccount,
        amount: newAmmount,
      },
    ]);
  }

  async function handleSubmit(values: SpendingFormValues) {
    if (!conversionFactor) return;
    const minorAmount = toMinorUnits(values.amount, conversionFactor);

    if (group) {
      const result = await withRequestLock(async () => {
        const newSpending = await createNewSpending({
          amount: minorAmount,
          groupId: group.id,
          categoryId: values.category,
        });
        if (!activeAccount) return;
        changeAccountAmmount(newSpending.data.accountAmount, activeAccount);

        return newSpending;
      });

      if (result === undefined) return;

      handleCancel();
    } else {
      const groupName = values.groupName;

      if (!groupName) return;

      const result = await withRequestLock(async () => {
        const newGroup = await createNewGroupWithSpending({
          amount: minorAmount,
          groupName,
          categoryId: values.category,
        });
        if (!activeAccount) return;
        changeAccountAmmount(newGroup.data.accountAmount, activeAccount);

        return newGroup;
      });

      if (result === undefined) return;

      handleCancel();
    }
  }

  return (
    <>
      <SpendingsForm
        isSubmitting={isSubmitting}
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
      {group?.id && <DeleteGroupAction groupId={group.id} />}
    </>
  );
}

export default SpendingsPage;
