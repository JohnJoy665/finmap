import { Button, Form, Input } from "antd";
import style from "./Registration.module.css";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import type { RuleObject } from "antd/es/form";
import { Link } from "react-router-dom";

const Item = Form.Item;

type RegistrationFormValues = {
  email: string;
  password: string;
  confirmPassword: string;
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

function Registration() {
  return (
    <div className={style.container}>
      <Form
        autoComplete="off"
        className={style.form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Item>
          <h1>Регистрация</h1>
        </Item>
        <Item
          name="email"
          rules={[
            { required: true, message: "Введите email" },
            { type: "email", message: "Некорректный email" },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="Email" />
        </Item>

        <Item
          name="password"
          rules={[
            { required: true, message: "Введите пароль" },
            { min: 5, message: "Пароль не должен быть менее 5 символов" },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Password" />
        </Item>

        <Item
          name="confirmPassword"
          dependencies={["password"]}
          rules={[
            { required: true, message: "Повторите пароль" },
            { min: 5, message: "Пароль не должен быть менее 5 символов" },
            ({ getFieldValue }) => validateConfirmPassword(getFieldValue),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Повторите пароль"
          />
        </Item>

        <Item>
          <Button block type="primary" htmlType="submit">
            Регистрация
          </Button>
          или <Link to={"/login"}>войти под своим логином</Link>
        </Item>
      </Form>
    </div>
  );
}

export default Registration;
