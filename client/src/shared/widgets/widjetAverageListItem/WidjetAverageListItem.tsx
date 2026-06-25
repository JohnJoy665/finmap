import { Avatar, Typography } from "antd";
import { MoreHorizontal } from "lucide-react";
import styles from "./WidjetAverageListItem.module.css";
import {
  fromMinorToMajorFormated,
  fromMinorToMajorNormalize,
} from "../../../utils/toMinorAmount";
import { categoryTheme, type CategoryCode } from "../../ui/colors/iconColors";
import { categoryIcons } from "../../../assets/icons/categoryIcons";

type AverageMode = "average" | "median";

type OtherAverageWidget = {
  id: "OTHER";
  title: string;
  isOther: true;
};

type AverageWidgetItem = {
  id: string;
  title: string;
  countPurchase: number;
  averageAmountMinor: string;
  medianAmountMinor: string;
  currencyCode: string;
  conversionFactor: number;
  type: "category" | "group";
};

export type AverageWidgetDisplayItem = AverageWidgetItem | OtherAverageWidget;

type WidjetAverageListItemProps = {
  categories: AverageWidgetDisplayItem[];
  mode: AverageMode;
};

function isOtherItem(
  item: AverageWidgetDisplayItem
): item is OtherAverageWidget {
  return "isOther" in item && item.isOther;
}

function WidjetAverageListItem({
  categories,
  mode,
}: WidjetAverageListItemProps) {
  const { Text } = Typography;

  function displayedPrice(amount: string, conversionFactor: number): string {
    if (Number(amount) <= 0) return "_.__";

    return Number(amount) < 100_000_00
      ? fromMinorToMajorNormalize(amount, conversionFactor)
      : fromMinorToMajorFormated(amount, conversionFactor);
  }

  function renderAvatar(item: AverageWidgetDisplayItem) {
    const isOther = isOtherItem(item);

    if (isOther) {
      return (
        <Avatar
          size={30}
          className={styles.avatar}
          style={{ backgroundColor: "rgba(100, 116, 139, 0.12)" }}
          icon={<MoreHorizontal size={16} color="#64748b" strokeWidth={2.2} />}
        />
      );
    }

    if (item.type === "group") {
      const avatarLabel = item.title.trim().charAt(0).toUpperCase() || "?";

      return (
        <Avatar size={30} className={styles.avatar}>
          {avatarLabel}
        </Avatar>
      );
    }

    const theme = categoryTheme[item.id as CategoryCode] ?? categoryTheme.GRO;

    const Icon = categoryIcons[item.id as CategoryCode] ?? categoryIcons.GRO;

    return (
      <Avatar
        size={30}
        className={styles.avatar}
        style={{ backgroundColor: theme.bg }}
        icon={<Icon size={16} color={theme.color} strokeWidth={2.2} />}
      />
    );
  }

  return (
    <div className={styles.list}>
      {categories.map((item) => {
        const isOther = isOtherItem(item);

        if (isOther) {
          return (
            <div key={item.id} className={styles.item}>
              {renderAvatar(item)}

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
            {renderAvatar(item)}

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

export default WidjetAverageListItem;
