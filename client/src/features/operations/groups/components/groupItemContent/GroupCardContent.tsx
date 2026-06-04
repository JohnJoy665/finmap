import { Flex } from "antd";
import styles from "./GroupCardContent.module.css";
import type { LucideIcon } from "lucide-react";

type GroupCardContentProps = {
  title: string;
  amount: string;
  Icon: LucideIcon;
  isConverted: boolean;
  currencySymbol: string;
};

function GroupCardContent({
  title,
  amount,
  Icon,
  isConverted,
  currencySymbol,
}: GroupCardContentProps) {
  return (
    <div className={styles.container}>
      <span className={styles.title}>{title}</span>
      <Flex align="center" justify="center">
        <Icon size={24} color={"var(--app-accent)"} />
      </Flex>

      <span className={styles.amount}>
        {isConverted ? "~" : ""} {amount} {currencySymbol}
      </span>
    </div>
  );
}

export default GroupCardContent;
