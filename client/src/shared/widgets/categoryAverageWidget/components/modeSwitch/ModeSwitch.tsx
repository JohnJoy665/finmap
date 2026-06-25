import { Segmented } from "antd";

import styles from "./ModeSwitch.module.css";

type AverageMode = "average" | "median";

type ModeSwitchProps = {
  mode: AverageMode;
  setMode: (value: AverageMode) => void;
};

function ModeSwitch({ mode, setMode }: ModeSwitchProps) {
  return (
    <div className={styles.root}>
      <Segmented
        size="small"
        className={styles.segmented}
        value={mode}
        onChange={(value) => setMode(value as AverageMode)}
        options={[
          { label: "Средний", value: "average" },
          { label: "Медианный", value: "median" },
        ]}
      />
    </div>
  );
}

export default ModeSwitch;
