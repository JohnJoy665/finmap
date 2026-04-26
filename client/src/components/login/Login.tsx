import { useEffect } from "react";
import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";

function Login() {
  const login = useAuthStore((state) => state.login);
  const isAuth = useAuthStore((state) => state.isAuth);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuth) {
      navigate("/app/operations");
    }
  }, [isAuth, navigate]);

  function handleLogin() {
    login();
  }


  return (
    <>
      <p>Логин</p>
      <button onClick={handleLogin}>Войти</button>
    </>
  );
}

export default Login;
