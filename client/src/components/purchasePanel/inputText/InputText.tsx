import { Form, Input } from "antd";
import styles from "./InputText.module.css";

type InputTextProps = {
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  autoFocus?: boolean;
  label: string;
};

function InputText({ autoFocus, label, onChange, value }: InputTextProps) {
  const { status, errors } = Form.Item.useStatus();

  const message = status === "error" ? errors[0] : label;

  return (
    <>
      <Input
        onChange={onChange}
        value={value}
        className={styles.field}
        autoFocus={autoFocus}
        variant="borderless"
      />
      <span
        className={`${styles["field__message"]} ${status === "error" ? styles["field__message--error"] : styles["field__message--lable"]}`}
      >
        {message}
      </span>
    </>
  );
}

export default InputText;
