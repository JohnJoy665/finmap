import { useLocation, useNavigate } from "react-router-dom";
import SpendingsForm from "../../features/operations/spendings/components/spendingsForm/SpendingsForm";
import { useEffect, useRef } from "react";
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
import SpendingsListContainer from "../../features/operations/spendings/components/spendingsList/components/spendingsListContainer/SpendingsListContainer";
import { useModalStore } from "../../shared/ui/modal";
import { useFiltersStore } from "../../store/filtersStore";
import { useGroupStore } from "../../store/groupStore";

function SpendingsPage() {
  const openModal = useModalStore((state) => state.openModal);
  const navigate = useNavigate();
  // const { state } = useLocation();

  const location = useLocation();
  const state = location.state as {
    mode?: "add-purchase" | "edit-group";
    group?: Group;
  } | null;

  const group: Group | undefined = state?.group;
  const mode = state?.mode;

  useEffect(() => {
    if (!mode) {
      navigate("/app/operations", { replace: true });
    }
  }, [mode, navigate]);

  const { isSubmitting, withRequestLock } = useRequestLock();
  const lastSpendingCurrencyCodeRef = useRef<string | null>(null);

  function handleLastSpendingCurrencyChange(currencyCode: string | null) {
    lastSpendingCurrencyCodeRef.current = currencyCode;
  }

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

  const currencyCode = useProfileStore((store) => store.account?.currencyCode);

  const clearGroupsFilter = useFiltersStore((store) => store.clearGroupsFilter);
  const setGroups = useGroupStore((store) => store.setGroups);

  useEffect(() => {
    async function requestCategories() {
      const { categories, setCategories } = usePurchaseStore.getState();

      if (categories.length !== 0) return;

      const categoriesResult = await getCategories();
      setCategories(categoriesResult.data);
    }

    requestCategories();
  }, []);

  // TODO добавить механику, при которой сброс групп и фильтров происходит и при переходе просто назад.

  function handleCancel() {
    clearGroupsFilter();
    setGroups([]);
    navigate("/app/operations");
  }

  function changeAccountAmmount(newAmount: string, activeAccount: string) {
    updateProfileAmount({ accountId: activeAccount, newAmount });
    updateListAmountAccounts([
      {
        accountId: activeAccount,
        amount: newAmount,
      },
    ]);
  }

  async function handleSubmit(values: SpendingFormValues) {
    if (!conversionFactor) return;

    const minorAmount = toMinorUnits(values.amount, conversionFactor);

    if (group) {
      async function confirmedCreateSpending(values: SpendingFormValues) {
        const result = await withRequestLock(async () => {
          if (!group) return;

          const newSpending = await createNewSpending({
            amount: minorAmount,
            groupId: group?.id,
            categoryId: values.category,
          });
          if (!activeAccount) return;
          changeAccountAmmount(newSpending.data.accountAmount, activeAccount);
          return newSpending;
        });

        if (result === undefined) return;

        handleCancel();
      }

      if (currencyCode !== lastSpendingCurrencyCodeRef.current) {
        openModal({
          type: "confirmAction",
          strategy: "destroy",
          props: {
            danger: false,
            title: "Добавить покупку",
            content:
              "Валюта этой покупки отличается от валюты последней покупки в группе. Убедитесь, что всё указано верно.",
            confirmText: "Все врено - продолжить",
            cancelText: "Отмена",
            onConfirm: () => confirmedCreateSpending(values),
          },
        });
      } else {
        confirmedCreateSpending(values);
      }
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
      {group?.id && (
        <SpendingsListContainer
          onLastSpendingCurrencyChange={handleLastSpendingCurrencyChange}
          groupId={group.id}
        />
      )}
      {group?.id && <DeleteGroupAction groupId={group.id} />}
    </>
  );
}

export default SpendingsPage;
