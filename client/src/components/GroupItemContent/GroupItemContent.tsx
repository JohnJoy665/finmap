import { Flex } from "antd";
import styles from "./GroupItemContent.module.css"

type GroupItemContentProps = {
  title: string;
  amount: number;
  Icon: React.ComponentType;
};

function GroupItemContent({ title, amount, Icon }: GroupItemContentProps) {
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


export default GroupItemContent;