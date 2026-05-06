import styles from "./AmountKeyboard.module.css";

type AmountKeyboardProps = {
  onPress: (key: string) => void;
};

const keys = [
  "1", "2", "3",
  "4", "5", "6",
  "7", "8", "9",
  ".", "0", "<",
];

function AmountKeyboard({ onPress }: AmountKeyboardProps) {
  return (
    <div className={styles.grid}>
      {keys.map((key) => (
        <button
          key={key}
          type="button"
          className={styles.key}
          onClick={() => onPress(key)}
        >
          {key}
        </button>
      ))}
    </div>
  );
}

export default AmountKeyboard;