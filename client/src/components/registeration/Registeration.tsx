import { Button, Form, Input } from "antd";
import style from "./Registration.module.css";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import type { RuleObject } from "antd/es/form";

type RegistrationFormValues = {
  email: string;
  password: string;
};

function handleSubmit(value: RegistrationFormValues) {
  console.log(value);
}

function validateConfirmPassword(
  getFieldValue: (name: string) => string
): RuleObject {
  return {
    validator(_, value) {
      if (!value || getFieldValue("password") === value) {
        return Promise.resolve();
      }

      return Promise.reject(new Error("Пароли не совпадают"));
    },
  };
}

function Registeration() {
  return (
    <div className={style.container}>
      <Form className={style.form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item>
            <h1>Регистрация</h1>
        </Form.Item>
        <Form.Item
          name="email"
          rules={[
            { required: true, message: "Введите email" },
            { type: "email", message: "Некорректный email" },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="Email" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[
            { required: true, message: "Введите пароль" },
            { min: 5, message: "Пароль не должен быть менее 5 символов" },
          ]}
        >
          <Input
            prefix={<LockOutlined />}
            type="password"
            placeholder="Password"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          dependencies={["password"]}
          rules={[
            { required: true, message: "Повторите пароль" },
            { min: 5, message: "Пароль не должен быть менее 5 символов" },
            ({ getFieldValue }) => validateConfirmPassword(getFieldValue),
          ]}
        >
          <Input
            prefix={<LockOutlined />}
            type="password"
            placeholder="Повторите пароль"
          />
        </Form.Item>

        <Form.Item>
          <Button block type="primary" htmlType="submit">
            Регистрация
          </Button>
          или <a href="/login">Войти если есть логин</a>
        </Form.Item>
      </Form>
    </div>
  );
}

export default Registeration;
