import { Flex } from "antd";
import styles from "./GroupCardContent.module.css";
import type { LucideIcon } from "lucide-react";
import { categoryTheme } from "../../../../../shared/ui/colors/iconColors";

type GroupCardContentProps = {
  title: string;
  amount: string;
  Icon: LucideIcon;
  isConverted: boolean;
  categoryCode: string;
};

function GroupCardContent({
  title,
  amount,
  Icon,
  isConverted,
  categoryCode,
}: GroupCardContentProps) {
  const theme = categoryTheme[categoryCode] ?? categoryTheme.GRO;
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
        {isConverted && Number(amount) !== 0 ? "~" : ""} {amount}
      </span>
    </div>
  );
}

export default GroupCardContent;
