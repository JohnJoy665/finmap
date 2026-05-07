import { Form, Select } from "antd";
import styles from "./CategorySelect.module.css";

// type CategoryOption = {
//     value: string;
//     label: string;
// }

type CategorySelectProps = {
  extra: string;
  name: string;
  placeholder: string;
  // options: CategoryOption[];
  rules: any[];
};

function CategorySelect({
  extra,
  name,
  placeholder,
  rules,
}: CategorySelectProps) {
  const form = Form.useFormInstance();
  return (
    <Form.Item noStyle shouldUpdate>
      {() => {
        const errors = form.getFieldError(name);
        const errorMessage = errors[0];

        return (
          <Form.Item className={styles.groupNameItem}
            extra={
              <span className={errorMessage ? styles.errorExtra : styles.extra}>
                {errorMessage || extra}
              </span>
            }
            name={name}
            rules={rules}
            help=""
            validateStatus={errorMessage ? "error" : undefined}
          >
            <Select
              className={styles.groupNameSelect}
              placeholder={placeholder}
              options={[
                { value: "ENT", label: "Развлечения" },
                { value: "GRO", label: "Продукты питания" },
              ]}
            />
          </Form.Item>
        );
      }}
    </Form.Item>
  );
}

export default CategorySelect;
