import styles from "./GroupButton.module.css";
import type React from "react";

type GroupButtonProps = {
  id: string;
  children: React.ReactNode;
  onClick: (id?: string) => void;
};

function GroupButton({ id, children, onClick }: GroupButtonProps) {
  return (
    <button className={styles.button} type="button" onClick={() => onClick(id)}>
      {children}
    </button>
  );
}

export default GroupButton;
