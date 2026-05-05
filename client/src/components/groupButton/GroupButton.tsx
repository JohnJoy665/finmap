import styles from "./GroupButton.module.css";
import type React from "react";

type GroupButtonProps = {
  id: string;
  children: React.ReactNode;
};

function GroupButton({ id, children }: GroupButtonProps) {
  function handleClick(id: string) {
    console.log(id);
  }
  return (
    <button
      className={styles.button}
      type="button"
      onClick={() => handleClick(id)}
    >
      {children}
    </button>
  );
}

export default GroupButton;
