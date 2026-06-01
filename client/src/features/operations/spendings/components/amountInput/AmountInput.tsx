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
  const initialValue = "0,00";

  const displayValue =
    value === ""
      ? initialValue
      : new Intl.NumberFormat(navigator.language, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(Number(value));

  function handlePress(key: string) {
    const lengthAmount = value.length;
    const indexDot = value.indexOf(".");

    if (key === "<" && lengthAmount === 0) return;

    if (key === "<") {
      if (indexDot > 0 && lengthAmount - indexDot === 2) {
        onChange?.(value.slice(0, -2));
        return;
      }

      onChange?.(value.slice(0, -1));
      return;
    }

    if (key === "." && lengthAmount === 0) return;

    if (key === "." && indexDot > 0) return;

    if (key === "0" && value[0] === "0") return;

    if (
      key === "0" &&
      indexDot > 0 &&
      value.includes("0") &&
      value[lengthAmount - 1] === "0"
    )
      return;

    if (indexDot > 0 && lengthAmount === indexDot + 3) return;

    onChange?.(value + key);
  }

  return (
    <div className={styles["amount-input"]}>
      <div className={styles["amount-input__display-container"]}>
        <div
          className={`${styles["amount-input__display"]} ${
            value === ""
              ? styles["amount-input__display--empty"]
              : styles["amount-input__display--full"]
          }`}
        >
          {displayValue}
        </div>

        <span
          className={`${styles["field__message"]} ${status === "error" ? styles["field__message--error"] : styles["field__message--lable"]}`}
        >
          {message}
        </span>
      </div>

      <AmountKeyboard onPress={handlePress} />
    </div>
  );
}

export default AmountInput;
