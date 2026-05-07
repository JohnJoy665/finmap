import { Form, Select } from "antd";
import styles from "./CategorySelect.module.css";

type CategorySelectProps = {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
};

function CategorySelect({ label, value, onChange }: CategorySelectProps) {
  const { status, errors } = Form.Item.useStatus();

  const message = status === "error" ? errors[0] : label;
  return (
    <>
      <Select
        className={styles.field}
        value={value}
        onChange={onChange}
        options={[
          { value: "ENT", label: "Развлечения" },
          { value: "GRO", label: "Продукты питания" },
        ]}
      />
      <span className={`${styles["field__message"]} ${status === "error" ? styles["field__message--error"] : styles['field__message--lable']}`}>{message}</span>
    </>
  );
}

export default CategorySelect;
