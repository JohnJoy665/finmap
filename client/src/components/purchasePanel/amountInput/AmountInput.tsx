import { Form } from "antd";
import AmountKeyboard from "../amountKeyboard/AmountKeyboard";
import styles from "./AmountInput.module.css";

type AmountInputProps = {
  value?: string;
  onChange?: (value: string) => void;
};

function AmountInput({ value = "", onChange }: AmountInputProps) {
  const { errors } = Form.Item.useStatus();

  const errorMessage = errors[0];

  function handlePress(key: string) {
    if (key === "<") {
      onChange?.(value.slice(0, -1));
      return;
    }

    if (key === "." && value.includes(".")) return;

    onChange?.(value + key);
  }

  return (
    <div className={styles.amountInput}>
      <div className={styles.display__container}>
        <div
          className={`${styles.display} ${
            value === ""
              ? styles["display--empty"]
              : styles["display--full"]
          }`}
        >
          {value || "00.00"}
        </div>

        <span className={styles.display__message}>
          {errorMessage || "Вот"}
        </span>
      </div>

      <AmountKeyboard onPress={handlePress} />
    </div>
  );
}

export default AmountInput;