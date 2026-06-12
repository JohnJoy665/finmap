import { Avatar, Progress, Typography } from "antd";
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
        const Icon = categoryIcons[item.id];

        const displayAmount =
          item.amount !== null
            ? Number(item.amount) > 0
              ? Number(item.amount) < 100_000_00
                ? fromMinorToMajorNormalize(item.amount, item.conversionFactor)
                : fromMinorToMajorFormated(item.amount, item.conversionFactor)
              : "_.__"
            : "Нет данных";

        return (
          <div key={item.id} className={styles.item}>
            <Avatar
              size={36}
              className={styles.avatar}
              style={{ backgroundColor: theme.bg }}
              icon={<Icon size={18} color={theme.color} strokeWidth={2.2} />}
            />

            <div className={styles.content}>
              <Text ellipsis className={styles.name}>
                {item.title}
              </Text>

              <Text type="secondary" className={styles.amount}>
                {displayAmount} {item.currencyCode}
              </Text>

              <Progress
                percent={item.percent}
                showInfo={false}
                strokeColor={theme.color}
                railColor="rgba(15, 23, 42, 0.07)"
                className={styles.progress}
              />
            </div>

            <Text strong className={styles.percent}>
              {item.percent}%
            </Text>
          </div>
        );
      })}
    </div>
  );
}

export default CategoryWidjetListItem;
