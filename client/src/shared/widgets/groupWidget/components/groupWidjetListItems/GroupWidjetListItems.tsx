import { Avatar, Typography } from "antd";
import { MoreHorizontal } from "lucide-react";
import styles from "./GroupWidjetListItems.module.css";
import {
  fromMinorToMajorFormated,
  fromMinorToMajorNormalize,
} from "../../../../../utils/toMinorAmount";

type OtherGroupItem = {
  id: "OTHER";
  title: string;
  amount: string;
  percent: number;
  currencyCode: string;
  conversionFactor: number;
  isOther: true;
};

type GroupStatisticsWidgetItem = {
  id: string;
  title: string;
  amount: string | null;
  currencyCode: string;
  conversionFactor: number;
  percent: number;
};

export type GroupWidgetDisplayItem = GroupStatisticsWidgetItem | OtherGroupItem;

type GroupWidjetListItemsProps = {
  groups: GroupWidgetDisplayItem[];
};

function GroupWidjetListItems({ groups }: GroupWidjetListItemsProps) {
  const { Text } = Typography;

  function displayedPrice(amount: string, conversionFactor: number): string {
    if (Number(amount) <= 0) return "_.__";

    return Number(amount) < 100_000_00
      ? fromMinorToMajorNormalize(amount, conversionFactor)
      : fromMinorToMajorFormated(amount, conversionFactor);
  }

  return (
    <div className={styles.list}>
      {groups.map((item) => {
        const isOther = "isOther" in item && item.isOther;
        if (!item.amount) return;
        const displayAmount = displayedPrice(
          item.amount,
          item.conversionFactor
        );

        const avatarLabel = isOther ? (
          <MoreHorizontal size={16} />
        ) : (
          (item.title?.trim()?.[0]?.toUpperCase() ?? "?")
        );

        return (
          <div
            key={item.id}
            className={styles.item}
            style={
              {
                "--group-percent": `${item.percent}%`,
              } as React.CSSProperties
            }
          >
            <Avatar size={30} className={styles.avatar}>
              {avatarLabel}
            </Avatar>

            <div className={styles.main}>
              <Text ellipsis className={styles.name}>
                {item.title}
              </Text>

              <Text type="secondary" className={styles.amount}>
                {displayAmount} {item.currencyCode}
              </Text>
            </div>

            <Text className={styles.percent}>{item.percent}%</Text>

            <div className={styles.progress} />
          </div>
        );
      })}
    </div>
  );
}

export default GroupWidjetListItems;
