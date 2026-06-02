import { Button, Typography } from "antd";
import SpendingsList from "../spendingsList/SpendingsList";
import styles from "./SpendingsListContainer.module.css";
import { useEffect, useState } from "react";
import { getSpendingsByGroup } from "../../../../api/getSpendingsByGroup";
import type { SpendingByGroupItem } from "../../../../../../../shared/types/spendings,types";

const { Text } = Typography;

// type Spending = {
//   id: string;
//   date: string;
//   amount: string;
//   title?: string | null;
// };

// const mockSpendings: Spending[] = [
//   {
//     id: "1",
//     date: "01.06/12:40",
//     amount: "1 250 ₽",
//     title: "Продукты",
//   },
//   {
//     id: "2",
//     date: "01.06/10:15",
//     amount: "320 ₽",
//     title: "Кофе",
//   },
//   {
//     id: "3",
//     date: "31.05/19:30",
//     amount: "2 800 ₽",
//     title: "Аптека",
//   },
//   {
//     id: "4",
//     date: "31.05/14:05",
//     amount: "750 ₽",
//     title: null,
//   },
// ];

type SpendingsListContainerProps = {
  groupId: string;
};

function SpendingsListContainer({ groupId }: SpendingsListContainerProps) {
  const [offsetCount, setOffsetCount] = useState<number>(0);
  const [spendings, setSpendings] = useState<SpendingByGroupItem[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const OFFSET = 5;

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

  return (
    <div className={styles.spendingsListContainer}>
      <Text className={styles.title}>Последние покупки</Text>

      <SpendingsList spendings={spendings} />

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
