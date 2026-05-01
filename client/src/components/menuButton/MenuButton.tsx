import { Button } from "antd";
import styles from "./MenuButton.module.css";
import { useAuthStore } from "../../store/authStore";

function MenuButton() {
  const logout = useAuthStore((state) => state.logout);

  return (
    <Button
      onClick={logout}
      type="text"
      className={styles.button}
    >
      <span className={styles.icon} />
    </Button>
  );
}

export default MenuButton;
