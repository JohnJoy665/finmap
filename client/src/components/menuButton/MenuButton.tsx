import { Button, theme } from "antd";
import styles from "./MenuButton.module.css";
import { useAuthStore } from "../../store/authStore";

function MenuButton() {
  const { token } = theme.useToken();
  const logout = useAuthStore((state) => state.logout);

  return (
    <Button
      onClick={logout}
      type="text"
      className={styles.button}
      style={{ backgroundColor: token.colorPrimary }}
    >
      <span className={styles.icon} />
    </Button>
  );
}

export default MenuButton;
