import { Form, Input } from "antd";
import styles from "./InputText.module.css";

type InputTextProps = {
  name: string;
  placeholder?: string;
  rules?: any[];
  autoFocus?: boolean;
  extra?: string;
};

function InputText({
  name,
  placeholder,
  rules,
  autoFocus,
  extra,
}: InputTextProps) {
  const form = Form.useFormInstance();

  console.log('рендер формы инаута')

  return (
    <Form.Item noStyle shouldUpdate>
      {() => {
        const errors = form.getFieldError(name);
        const errorMessage = errors[0];

        return (
          <Form.Item
            className={styles.groupNameItem}
            name={name}
            rules={rules}
            help=""
            validateStatus={errorMessage ? "error" : undefined}
            extra={
              <span className={errorMessage ? styles.errorExtra : styles.extra}>
                {errorMessage || extra}
              </span>
            }
 
          >
            <Input
              className={styles.groupNameInput}
              placeholder={placeholder}
              autoFocus={autoFocus}
              variant="borderless"
            />
          </Form.Item>
        );
      }}
    </Form.Item>
  );
}

export default InputText;