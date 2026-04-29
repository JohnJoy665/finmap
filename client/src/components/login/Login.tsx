import { Button, Form, Input } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import style from "./Login.module.css";
// import type { RuleObject } from "antd/es/form";
import { LockOutlined, MailOutlined } from "@ant-design/icons";

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

  return (
    <div className={style.container}>
      <Form className={style.form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item>
          <h1>Вход</h1>
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

        <Form.Item>
          <Button block type="primary" htmlType="submit">
            Войти
          </Button>
          or <a href="/registeration">Регистрация!</a>
        </Form.Item>
      </Form>
    </div>
  );
}

export default Login;
