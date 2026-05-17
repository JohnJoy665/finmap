import { Flex } from "antd";
import styles from "./GroupCardContent.module.css";

type GroupCardContentProps = {
  title: string;
  amount: string;
  Icon: React.ComponentType;
};

function GroupCardContent({ title, amount, Icon }: GroupCardContentProps) {
  return (
    <div className={styles.container}>
      <span className={styles.title}>{title}</span>
      <Flex align="center" justify="center">
        <Icon />
      </Flex>

      <span className={styles.amount}>{amount}</span>
    </div>
  );
}

export default GroupCardContent;
