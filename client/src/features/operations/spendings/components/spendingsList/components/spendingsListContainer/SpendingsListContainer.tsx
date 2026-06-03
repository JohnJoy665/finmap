import { Button, Typography } from "antd";
import SpendingsList from "../spendingsList/SpendingsList";
import styles from "./SpendingsListContainer.module.css";
import { useEffect, useState } from "react";
import { getSpendingsByGroup } from "../../../../api/getSpendingsByGroup";
import type { SpendingByGroupItem } from "../../../../../../../shared/types/spendings,types";
import { useProfileStore } from "../../../../../../../store/profileStore";
import { useAccountsStore } from "../../../../../../../store/accountsStore";

const { Text } = Typography;

type SpendingsListContainerProps = {
  groupId: string;
};

function SpendingsListContainer({ groupId }: SpendingsListContainerProps) {
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

  useEffect(() => {
    async function getNewSpendings() {
      try {
        const spendings = await getSpendingsByGroup({
          groupId,
          limitCount: OFFSET,
          offsetCount: offsetCount,
        });
        setSpendings((prev) => {
          return [...prev, ...spendings.data.items];
        });
        setHasMore(spendings.data.hasMore);
      } catch (error) {
        console.log(error);
      }
    }

    getNewSpendings();
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
  }

  return (
    <div className={styles.spendingsListContainer}>
      <Text className={styles.title}>Последние покупки</Text>

      <SpendingsList
        handleRenameSpending={renameSpending}
        handleChangeSpendingAmount={changeSpendingAmount}
        spendings={spendings}
      />

      {spendings.length >= OFFSET && (
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
