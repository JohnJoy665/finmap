import { Button, Typography } from "antd";
import SpendingsList from "../spendingsList/SpendingsList";
import styles from "./SpendingsListContainer.module.css";
import { useEffect, useState } from "react";
import { getSpendingsByGroup } from "../../../../api/getSpendingsByGroup";
import type { SpendingByGroupItem } from "../../../../../../../shared/types/spendings.types";
import { useProfileStore } from "../../../../../../../store/profileStore";
import { useAccountsStore } from "../../../../../../../store/accountsStore";
import { useFiltersStore } from "../../../../../../../store/filtersStore";

const { Text } = Typography;

type SpendingsListContainerProps = {
  groupId: string;
  onLastSpendingCurrencyChange: (currencyCode: string | null) => void;
};

function SpendingsListContainer({
  groupId,
  onLastSpendingCurrencyChange,
}: SpendingsListContainerProps) {
  const [offsetCount, setOffsetCount] = useState<number>(0);
  const [spendings, setSpendings] = useState<SpendingByGroupItem[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const OFFSET = 5;

  const activeAccount = useProfileStore((state) => state.account?.id);
  const updateProfileAmount = useProfileStore(
    (state) => state.updateProfileAmount
  );
  const updateListAmountAccounts = useAccountsStore(
    (store) => store.updateListAmountAccounts
  );

  const requestGroupsFiltersReload = useFiltersStore(
    (store) => store.requestGroupsFiltersReload
  );

  const isLastSpending = spendings.length === 1;

  useEffect(() => {
    async function loadSpendings() {
      try {
        const response = await getSpendingsByGroup({
          groupId,
          limitCount: OFFSET,
          offsetCount,
        });

        const items = response.data.items;

        if (offsetCount === 0) {
          setSpendings(items);

          onLastSpendingCurrencyChange?.(items[0]?.currencyCode ?? null);
        } else {
          setSpendings((prev) => [...prev, ...items]);
        }

        setHasMore(response.data.hasMore);
      } catch (error) {
        console.log(error);
      }
    }

    loadSpendings();
  }, [offsetCount, groupId]);

  function addNewSpendings() {
    setOffsetCount((prev) => prev + 5);
  }

  function resetSpendingsList() {
    setSpendings([]);
    setOffsetCount(0);
  }

  function renameSpending(spendingId: string, newName: string) {
    setSpendings((prev) =>
      prev.map((spending) =>
        spending.id === spendingId ? { ...spending, title: newName } : spending
      )
    );
  }

  function changeSpendingAmount(
    spendingId: string,
    newSpendingAmount: string,
    accountId: string,
    newAccountSpending: string
  ) {
    setSpendings((prev) =>
      prev.map((spending) =>
        spending.id === spendingId
          ? { ...spending, amount: newSpendingAmount }
          : spending
      )
    );

    if (activeAccount === accountId) {
      updateProfileAmount(newAccountSpending);
    }
    updateListAmountAccounts([
      {
        accountId,
        amount: newAccountSpending,
      },
    ]);
    requestGroupsFiltersReload();
  }

  function deleteSpending(
    spendingId: string,
    accountId: string,
    accountAmount: string
  ) {
    const nextSpendings = spendings.filter(
      (spending) => spending.id !== spendingId
    );

    setSpendings(nextSpendings);

    onLastSpendingCurrencyChange?.(nextSpendings[0]?.currencyCode || null);

    if (activeAccount === accountId) {
      updateProfileAmount(accountAmount);
    }
    updateListAmountAccounts([
      {
        accountId,
        amount: accountAmount,
      },
    ]);
    requestGroupsFiltersReload();
  }

  return (
    <div className={styles.spendingsListContainer}>
      <Text className={styles.title}>Последние покупки</Text>

      <SpendingsList
        handleRenameSpending={renameSpending}
        handleChangeSpendingAmount={changeSpendingAmount}
        handleDeleteSpending={deleteSpending}
        spendings={spendings}
        isLastSpending={isLastSpending}
      />

      {((spendings.length >= OFFSET && hasMore) ||
        (spendings.length > OFFSET && !hasMore)) && (
        <Button
          block
          type="link"
          className={styles.showMore}
          onClick={hasMore ? addNewSpendings : resetSpendingsList}
        >
          {hasMore ? "Показать еще" : "Скрыть"}
        </Button>
      )}
    </div>
  );
}

export default SpendingsListContainer;
