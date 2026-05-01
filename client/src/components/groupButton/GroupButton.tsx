import styles from "./GroupButton.module.css";
import FoodIcon from "../../assets/icons/FoodIcon";
import { Flex } from "antd";

function GroupButton() {
  return (
    <button className={styles.button} type="button">
      <span
        className={styles.title}
      >
        Транспорт по Нови-Саду и другие отчаянные грыппы туристов
      </span>
      <Flex align="center" justify="center">
        <FoodIcon />
      </Flex>

      <span className={styles.amount}>- 2 000 RSD</span>
    </button>
  );
}

export default GroupButton;
