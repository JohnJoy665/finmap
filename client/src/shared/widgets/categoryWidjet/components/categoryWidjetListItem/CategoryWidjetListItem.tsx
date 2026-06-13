import { Avatar, Typography } from "antd";
import styles from "./CategoryWidjetListItem.module.css";
import type { CategoryStatisticsWidgetItem } from "../../api/getCategoryStatisticsWidget";
import { categoryTheme } from "../../../../ui/colors/iconColors";
import { categoryIcons } from "../../../../../assets/icons/categoryIcons";
import {
  fromMinorToMajorFormated,
  fromMinorToMajorNormalize,
} from "../../../../../utils/toMinorAmount";

type CategoryWidjetListItemProps = {
  categories: CategoryStatisticsWidgetItem[];
  isLoading: boolean;
};

function CategoryWidjetListItem({ categories }: CategoryWidjetListItemProps) {
  const { Text } = Typography;

  return (
    <div className={styles.list}>
      {categories.map((item) => {
        const theme: { color: string; bg: string } =
          categoryTheme[item.id] ?? categoryTheme.GRO;

        const Icon = categoryIcons[item.id] ?? categoryIcons.GRO;

        const displayAmount =
          item.amount !== null
            ? Number(item.amount) > 0
              ? Number(item.amount) < 100_000_00
                ? fromMinorToMajorNormalize(item.amount, item.conversionFactor)
                : fromMinorToMajorFormated(item.amount, item.conversionFactor)
              : "_.__"
            : "Нет данных";

        return (
          <div
            key={item.id}
            className={styles.item}
            style={
              {
                "--category-color": theme.color,
                "--category-percent": `${item.percent}%`,
              } as React.CSSProperties
            }
          >
            <Avatar
              size={30}
              className={styles.avatar}
              style={{ backgroundColor: theme.bg }}
              icon={<Icon size={16} color={theme.color} strokeWidth={2.2} />}
            />

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

export default CategoryWidjetListItem;
