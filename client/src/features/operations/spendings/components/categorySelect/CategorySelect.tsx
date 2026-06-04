import { Form, Select } from "antd";
import styles from "./CategorySelect.module.css";
import CategoryOption from "../categoryOption/CategoryOption";
import { categoryIcons } from "../../../../../assets/icons/categoryIcons";
import { usePurchaseStore } from "../../../../../store/purchaseStore";
import { useState } from "react";
import { useLockBodyScroll } from "../../../../../hooks/useScrollBodyBlock";

type CategorySelectProps = {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
};

function CategorySelect({ label, value, onChange }: CategorySelectProps) {
  const [open, setOpen] = useState<boolean>(false);
  const { status, errors } = Form.Item.useStatus();
  const categories = usePurchaseStore((state) => state.categories);

  const message = status === "error" ? errors[0] : label;

  const categoryOptions = categories.map((category) => ({
    value: category.id,
    label: category.translation,
    category,
  }));

  useLockBodyScroll(open);

  return (
    <>
      <Select
        className={styles.field}
        value={value}
        open={open}
        onOpenChange={setOpen}
        onChange={onChange}
        options={categoryOptions}
        optionRender={(option) => {
          const category = option.data.category;
          const Icon = categoryIcons[category.code];

          return (
            <CategoryOption categoryName={category.translation} Icon={Icon} />
          );
        }}
        labelRender={(selected) => {
          const category = categories.find(
            (category) => category.id === selected.value
          );

          if (!category) return selected.label;

          const Icon = categoryIcons[category.code];

          return (
            <CategoryOption
              categoryName={category.translation}
              Icon={Icon}
              iconSize={28}
              textSize={28}
              height={40}
            />
          );
        }}
      />

      <span
        className={`${styles["field__message"]} ${
          status === "error"
            ? styles["field__message--error"]
            : styles["field__message--lable"]
        }`}
      >
        {message}
      </span>
    </>
  );
}

export default CategorySelect;
