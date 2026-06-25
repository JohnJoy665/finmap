import { Avatar, Typography } from "antd";
import { MoreHorizontal } from "lucide-react";

import {
  categoryTheme,
  type CategoryCode,
} from "../../../../ui/colors/iconColors";

import type { CategoryAverageWidgetItem } from "../../api/getCategoryAverageWidget";
import { categoryIcons } from "../../../../../assets/icons/categoryIcons";

import {
  fromMinorToMajorFormated,
  fromMinorToMajorNormalize,
} from "../../../../../utils/toMinorAmount";

import styles from "./CategoryWidjetAverageListItem.module.css";

type AverageMode = "average" | "median";

type OtherCategoryAverageWidget = {
  id: "OTHER";
  title: string;
  isOther: true;
};

export type CategoryAverageWidgetDisplayItem =
  | CategoryAverageWidgetItem
  | OtherCategoryAverageWidget;

type CategoryWidjetAverageListItemProps = {
  categories: CategoryAverageWidgetDisplayItem[];
  mode: AverageMode;
};

function isOtherCategory(
  item: CategoryAverageWidgetDisplayItem
): item is OtherCategoryAverageWidget {
  return "isOther" in item && item.isOther;
}

function CategoryWidjetAverageListItem({
  categories,
  mode,
}: CategoryWidjetAverageListItemProps) {
  const { Text } = Typography;

  function displayedPrice(amount: string, conversionFactor: number): string {
    if (Number(amount) <= 0) return "_.__";

    return Number(amount) < 100_000_00
      ? fromMinorToMajorNormalize(amount, conversionFactor)
      : fromMinorToMajorFormated(amount, conversionFactor);
  }

  return (
    <div className={styles.list}>
      {categories.map((item) => {
        const isOther = isOtherCategory(item);

        const theme: { color: string; bg: string } = isOther
          ? { color: "#64748b", bg: "rgba(100, 116, 139, 0.12)" }
          : (categoryTheme[item.id as CategoryCode] ?? categoryTheme.GRO);

        const Icon = isOther
          ? MoreHorizontal
          : (categoryIcons[item.id as CategoryCode] ?? categoryIcons.GRO);

        if (isOther) {
          return (
            <div key={item.id} className={styles.item}>
              <Avatar
                size={30}
                className={styles.avatar}
                style={{ backgroundColor: theme.bg }}
                icon={<Icon size={16} color={theme.color} strokeWidth={2.2} />}
              />

              <div className={styles.main}>
                <Text ellipsis className={styles.nameOther}>
                  {item.title}
                </Text>
              </div>
            </div>
          );
        }

        const amountMinor =
          mode === "median" ? item.medianAmountMinor : item.averageAmountMinor;

        const displayAmount = displayedPrice(
          amountMinor,
          item.conversionFactor
        );

        return (
          <div key={item.id} className={styles.item}>
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

              <Text type="secondary" ellipsis className={styles.count}>
                {item.countPurchase}
              </Text>

              <Text type="secondary" ellipsis className={styles.amount}>
                {displayAmount} {item.currencyCode}
              </Text>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default CategoryWidjetAverageListItem;
