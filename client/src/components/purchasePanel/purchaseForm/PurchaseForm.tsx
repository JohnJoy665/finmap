import { Button, Form, Flex } from "antd";
import { useNavigate } from "react-router-dom";
import AmountInput from "../amountInput/AmountInput";
import InputText from "../inputText/InputText";
import styles from "./PurchaseForm.module.css";
import CategorySelect from "../categorySelect/CategorySelect";

function PurchaseFrom() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  function handleCancel() {
    form.resetFields();
    navigate("/app/operations");
  }

  function handleFinish(values: string) {
    console.log(values);
  }

  return (
    <Form
      className={styles.form}
      form={form}
      layout="vertical"
      onFinish={handleFinish}
    >
      <Form.Item
        className={styles.form__item}
        name={"groupName"}
        help={null}
        rules={[
          { required: true, message: "Заполните название группы" },
          { max: 25, message: "Достигнуто макисмальное число символов" },
        ]}
      >
        <InputText autoFocus={true} label={"Название группы"} />
      </Form.Item>

      <Form.Item
        className={styles.form__item}
        name={"category"}
        help={null}
        rules={[{ required: true, message: "Выберите категорию" }]}
      >
        <CategorySelect label={"Категория"} />
      </Form.Item>

      <Form.Item
      className={styles.form__item}
        name="amount"
        rules={[
          {
            validator: (_, value) => {
              if (!value || Number(value) <= 0) {
                return Promise.reject(new Error("Введите сумму покупки"));
              }

              return Promise.resolve();
            },
          },
        ]}
      >
        <AmountInput label={"Сумма покупки"}/>
      </Form.Item>

      <Flex gap="middle">
        <Button block danger onClick={handleCancel}>
          Назад
        </Button>

        <Button block type="primary" htmlType="submit">
          Сохранить
        </Button>
      </Flex>
    </Form>
  );
}

export default PurchaseFrom;

// autoFocus
// />

// <CategorySelect
//   extra={"Категория"}
//   name={"category"}
//   placeholder={"Выберите категорию"}
//   rules={[{ required: true, message: "Выберите категорию" }]}
// />

// <Form.Item
//   name="amount"
//   help=""
//   rules={[
//     {
//       validator: (_, value) => {
//         if (!value || Number(value) <= 0) {
//           return Promise.reject(new Error("Введите сумму покупки"));
//         }

//         return Promise.resolve();
//       },
//     },
//   ]}
// >
//   <AmountInput />
