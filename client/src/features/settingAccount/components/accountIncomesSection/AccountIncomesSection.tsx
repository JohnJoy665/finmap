import { Button, Collapse, Flex } from "antd";
import type { CollapseProps } from "antd";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
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
  const [activeCollapseKeys, setActiveCollapseKeys] = useState<string[]>([]);

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
    setOffsetCount((prev) => prev + OFFSET);
  }

  function resetIncomesList() {
    setIncomes([]);
    setOffsetCount(0);
  }

  function handleIncomeCreated(newIncome: IncomeItem) {
    setIncomes((prev) => [newIncome, ...prev]);
  }

  function renameIncome(incomeId: string, newName: string) {
    setIncomes((prev) =>
      prev.map((income) =>
        income.id === incomeId ? { ...income, name: newName } : income
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
      accountId,
      newAmount: newAccountAmount,
    });

    updateListAmountAccounts([
      {
        accountId,
        amount: newAccountAmount,
      },
    ]);
  }

  function deleteIncome(
    incomeId: string,
    accountId: string,
    accountAmount: string
  ) {
    const nextIncomes = incomes.filter((income) => income.id !== incomeId);

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
  }

  const collapseItems: CollapseProps["items"] = [
    {
      key: "account-incomes",
      label: <span className={styles.collapseTitle}>Пополнение счета</span>,
      classNames: {
        header: styles.rootCollapseHeader,
        body: styles.rootCollapseBody,
      },
      styles: {
        header: {
          padding: 0,
          alignItems: "center",
        },
        body: {
          padding: 0,
        },
      },
      children: (
        <Flex vertical className={styles.panelContent}>
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
      ),
    },
  ];

  return (
    <Collapse
      ghost
      bordered={false}
      items={collapseItems}
      activeKey={activeCollapseKeys}
      expandIconPlacement="end"
      className={styles.collapse}
      onChange={(keys) =>
        setActiveCollapseKeys(Array.isArray(keys) ? keys : [keys])
      }
      expandIcon={({ isActive }) =>
        isActive ? (
          <MinusOutlined
            className={styles.collapseIcon}
            style={{
              color: "var(--app-accent)",
              fontSize: 24,
            }}
          />
        ) : (
          <PlusOutlined
            className={styles.collapseIcon}
            style={{
              color: "var(--app-accent)",
              fontSize: 24,
            }}
          />
        )
      }
    />
  );
}

export default AccountIncomesSection;
