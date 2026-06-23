import { Avatar, Typography } from "antd";
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
  groups: GroupStatisticsWidgetItem[];
};

function GroupWidjetListItems({ groups }: GroupWidjetListItemsProps) {
  const { Text } = Typography;

  return (
    <div className={styles.list}>
      {groups.map((item) => {
        const displayAmount =
          item.amount !== null
            ? Number(item.amount) > 0
              ? Number(item.amount) < 100_000_00
                ? fromMinorToMajorNormalize(item.amount, item.conversionFactor)
                : fromMinorToMajorFormated(item.amount, item.conversionFactor)
              : "_.__"
            : "Нет данных";

        const avatarLabel = item.title?.trim()?.[0]?.toUpperCase() ?? "?";

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
