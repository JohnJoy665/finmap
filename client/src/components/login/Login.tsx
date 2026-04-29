import { Button, Form, Input } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import style from "./Login.module.css";
// import type { RuleObject } from "antd/es/form";
import { LockOutlined, MailOutlined } from "@ant-design/icons";

const Item = Form.Item;

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
        <Item>
          <h1>Вход</h1>
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

        <Item>
          <Button block type="primary" htmlType="submit">
            Войти
          </Button>
          or <Link to={"/registration"}>Регистрация!</Link>
        </Item>
      </Form>
    </div>
  );
}

export default Login;
