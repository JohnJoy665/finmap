import { Button, Form, Input } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import style from "./Login.module.css";
import type { RuleObject } from "antd/es/form";

type LoginFormValues = {
  email: string;
  password: string;
};

function Login() {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  function handleSubmit(values: LoginFormValues) {
    console.log(values);

    login();
    navigate("/app/operations");
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

  return (
    <div className={style.container}>
      <Form className={style.form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Введите email" },
            { type: "email", message: "Некорректный email" },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Пароль"
          name="password"
          rules={[{ required: true, message: "Введите пароль", min: 5 }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          label="Повторите пароль"
          name="confirmPassword"
          dependencies={["password"]}
          rules={[
            { required: true, message: "Повторите пароль", min: 5 },
            ({ getFieldValue }) => validateConfirmPassword(getFieldValue),
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Button type="primary" htmlType="submit" block>
          Войти
        </Button>
      </Form>
    </div>
  );
}

export default Login;
