import styles from "./GroupCard.module.css";
import type React from "react";

type GroupCardProps = {
  id: string;
  children: React.ReactNode;
  onClick: (id?: string) => void;
  amount?: string;
};

function GroupCard({ id, children, onClick, amount }: GroupCardProps) {
  return (
    <button
      className={`${styles.button} ${Number(amount) === 0 ? styles.empty : ""}`}
      type="button"
      onClick={() => onClick(id)}
    >
      {children}
    </button>
  );
}

export default GroupCard;
