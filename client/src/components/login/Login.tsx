import { useAuthStore } from "../../store/authStore";

function Login() {
  const login = useAuthStore((state) => state.login);

  return (
    <>
      <p>Логин</p>
      <button onClick={login}>Войти</button>
    </>
  );
}

export default Login;
