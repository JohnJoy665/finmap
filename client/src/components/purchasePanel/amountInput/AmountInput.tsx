import { Form } from "antd";
import AmountKeyboard from "../amountKeyboard/AmountKeyboard";
import styles from "./AmountInput.module.css";

type AmountInputProps = {
  value?: string;
  onChange?: (value: string) => void;
  label: string;
};

function AmountInput({ value = "", onChange, label }: AmountInputProps) {
  const { status, errors } = Form.Item.useStatus();

  const message = status === "error" ? errors[0] : label;

  function handlePress(key: string) {
    if (key === "<") {
      onChange?.(value.slice(0, -1));
      return;
    }

    if (key === "." && value.includes(".")) return;

    onChange?.(value + key);
  }

  return (
    <div className={styles["amount-input"]}>
      <div className={styles["amount-input__display-container"]}>
        <div
          className={`${styles['amount-input__display']} ${
            value === ""
              ? styles["amount-input__display--empty"]
              : styles["amount-input__display--full"]
          }`}
        >
          {value || "00.00"}
        </div>

        <span className={`${styles["field__message"]} ${status === "error" ? styles["field__message--error"] : styles['field__message--lable']}`}>{message}</span>
      </div>

      <AmountKeyboard onPress={handlePress} />
    </div>
  );
}

export default AmountInput;