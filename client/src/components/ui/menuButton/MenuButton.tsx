import { Button } from "antd";
import styles from "./MenuButton.module.css";
import { useAuthStore } from "../../../store/authStore";
import { useProfileStore } from "../../../store/profileStore";
import { useFiltersStore } from "../../../store/filtersStore";
import { useGroupStore } from "../../../store/groupStore";
import { usePurchaseStore } from "../../../store/purchaseStore";

function MenuButton() {
  function handleLogout() {
    useAuthStore.getState().logout();

    useProfileStore.getState().reset();
    useFiltersStore.getState().reset();
    useGroupStore.getState().reset();
    usePurchaseStore.getState().reset();
  }

  return (
    <Button onClick={handleLogout} type="text" className={styles.button}>
      <span className={styles.icon} />
    </Button>
  );
}

export default MenuButton;
