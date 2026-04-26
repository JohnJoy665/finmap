import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";

function Login() {
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  function handleLogin() {
    login();
    navigate("/app/operations");
  }

  return (
    <>
      <p>Логин</p>
      <button onClick={handleLogin}>Войти</button>
    </>
  );
}

export default Login;
