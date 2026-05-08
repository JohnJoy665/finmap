import { Form, Select } from "antd";
import styles from "./CategorySelect.module.css";
import { categories as categoryMOCK } from "../../../mocks/categories";
import CategoryOption from "../categoryOption/CategoryOption";
import { categoryIcons } from "../../../assets/icons/categoryIcons";

type CategorySelectProps = {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
};


function CategorySelect({ label, value, onChange }: CategorySelectProps) {
  const { status, errors } = Form.Item.useStatus();

  const message = status === "error" ? errors[0] : label;

  const categoryForRender = categoryMOCK.map((category) => ({value: category.id, label:<CategoryOption categoryName={category.title} Icon={categoryIcons[category.code]} />}))
  return (
    <>
      <Select
        className={styles.field}
        value={value}
        onChange={onChange}
        options={categoryForRender}
      />
      <span className={`${styles["field__message"]} ${status === "error" ? styles["field__message--error"] : styles['field__message--lable']}`}>{message}</span>
    </>
  );
}

export default CategorySelect;
