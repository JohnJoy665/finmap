import { Button, Form, Input, Typography } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import style from "./Login.module.css";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { getLoginRequest } from "../../api/authApi";

const Item = Form.Item;
const { Title } = Typography;

type LoginFormValues = {
  email: string;
  password: string;
};

function Login() {
  const navigate = useNavigate();

  async function handleSubmit(values: LoginFormValues) {
    try {
      const response = await getLoginRequest(values);

      useAuthStore.getState().setAuth({
        user: response.data.user,
        token: response.data.token,
      });

      navigate("/app/operations");
    } catch (error) {
      console.log(error); //TODO подумать, что тут будет
    }
  }

  return (
    <div className={style.container}>
      <Form
        autoComplete="off"
        className={style.form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Title className={style.title} level={3}>
          Вход
        </Title>

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
