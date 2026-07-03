import { Button, Flex } from "antd";
import { useEffect, useState } from "react";

import AddIncomeSection from "../addIncomeSection/AddIncomeSection";
import IncomeHistorySection from "../incomeHistorySection/IncomeHistorySection";
import styles from "./AccountIncomesSection.module.css";
import { getAccountIncomes } from "../../api/getAccountIncomes";
import { useProfileStore } from "../../../../store/profileStore";
import { useAccountsStore } from "../../../../store/accountsStore";

export type IncomeItem = {
  id: string;
  date: string;
  time: string;
  amount: string;
  conversionFactor: number;
  currencySymbol: string;
  name: string | null;
  currencyCode: string;
};

type AccountIncomesSectionProps = {
  accountId: string;
};

function AccountIncomesSection({ accountId }: AccountIncomesSectionProps) {
  const OFFSET = 5;
  const [offsetCount, setOffsetCount] = useState<number>(0);
  const [incomes, setIncomes] = useState<IncomeItem[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const updateProfileAmount = useProfileStore(
    (state) => state.updateProfileAmount
  );
  const updateListAmountAccounts = useAccountsStore(
    (store) => store.updateListAmountAccounts
  );

  useEffect(() => {
    async function loadIncomes() {
      try {
        const response = await getAccountIncomes({
          accountId,
          limitCount: OFFSET,
          offsetCount,
        });

        const items = response.data.items;

        if (offsetCount === 0) {
          setIncomes(items);
        } else {
          setIncomes((prev) => [...prev, ...items]);
        }

        setHasMore(response.data.hasMore);
      } catch (error) {
        console.log(error);
      }
    }

    loadIncomes();
  }, [offsetCount, accountId]);

  function addNewIncomes() {
    setOffsetCount((prev) => prev + 5);
  }

  function resetIncomesList() {
    setIncomes([]);
    setOffsetCount(0);
  }

  function handleIncomeCreated(newIncome: IncomeItem) {
    setIncomes((prev) => [newIncome, ...prev]);
  }

  function renameIncome(IncomeId: string, newName: string) {
    setIncomes((prev) =>
      prev.map((income) =>
        income.id === IncomeId ? { ...income, name: newName } : income
      )
    );
  }

  function changeIncomeAmount(
    incomeId: string,
    newIncomeAmount: string,
    accountId: string,
    newAccountAmount: string
  ) {
    setIncomes((prev) =>
      prev.map((income) =>
        income.id === incomeId ? { ...income, amount: newIncomeAmount } : income
      )
    );

    updateProfileAmount({
      accountId: accountId,
      newAmount: newAccountAmount,
    });
    updateListAmountAccounts([
      {
        accountId,
        amount: newAccountAmount,
      },
    ]);
    // refreshOperations();
  }

  function deleteIncome(
    incomeId: string,
    accountId: string,
    accountAmount: string
  ) {
    console.log(accountId, accountAmount);
    const nextIncomes = incomes.filter((spending) => spending.id !== incomeId);

    setIncomes(nextIncomes);

    updateProfileAmount({
      accountId,
      newAmount: accountAmount,
    });
    updateListAmountAccounts([
      {
        accountId,
        amount: accountAmount,
      },
    ]);
    // refreshOperations();
  }

  return (
    <Flex vertical className={styles.container}>
      <AddIncomeSection
        onIncomeCreated={handleIncomeCreated}
        key={`add-income-${accountId}`}
        accountId={accountId}
      />

      <IncomeHistorySection
        handleRenameIncome={renameIncome}
        handleChangeIncomeAmount={changeIncomeAmount}
        handleDeleteIncome={deleteIncome}
        incomes={incomes}
      />
      {((incomes.length >= OFFSET && hasMore) ||
        (incomes.length > OFFSET && !hasMore)) && (
        <Button
          block
          type="link"
          className={styles.showMore}
          onClick={hasMore ? addNewIncomes : resetIncomesList}
        >
          {hasMore ? "Показать еще" : "Скрыть"}
        </Button>
      )}
    </Flex>
  );
}

export default AccountIncomesSection;
