import { Flex } from "antd";
import styles from "./GroupCardContent.module.css";
import type { LucideIcon } from "lucide-react";
import {
  categoryTheme,
  type CategoryCode,
} from "../../../../../shared/ui/colors/iconColors";
import {
  fromMinorToMajorFormated,
  fromMinorToMajorNormalize,
} from "../../../../../utils/toMinorAmount";

type GroupCardContentProps = {
  title: string;
  amount: string;
  Icon: LucideIcon;
  isConverted: boolean;
  categoryCode: CategoryCode;
  conversionFactor: number;
};

function GroupCardContent({
  title,
  amount,
  Icon,
  isConverted,
  categoryCode,
  conversionFactor,
}: GroupCardContentProps) {
  const theme: { color: string; bg: string } =
    categoryTheme[categoryCode] ?? categoryTheme.GRO;

  const displayAmount =
    amount !== null
      ? Number(amount) > 0
        ? Number(amount) < 100_000_00
          ? fromMinorToMajorNormalize(amount, conversionFactor)
          : fromMinorToMajorFormated(amount, conversionFactor)
        : "_.__"
      : "Нет данных";

  return (
    <div className={styles.container}>
      <Flex
        className={styles["icon-container"]}
        align="center"
        justify="center"
        style={{ backgroundColor: theme.bg }}
      >
        <Icon size={15} color={theme.color} />
      </Flex>

      <span className={styles.title}>{title}</span>
      <span className={styles.amount}>
        {isConverted && Number(amount) !== 0 ? "~" : ""}
        {displayAmount}
      </span>
    </div>
  );
}

export default GroupCardContent;
