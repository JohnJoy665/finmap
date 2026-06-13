import { Card, Collapse } from "antd";
import type { CollapseProps } from "antd";

import styles from "./StatsWidget.module.css";
import { ChevronDown, ChevronUp } from "lucide-react";

type StatsWidgetProps = {
  widgetKey: string;
  mainPanel: React.ReactNode;
  listItems: React.ReactNode;
  disabled?: boolean;
};

function StatsWidget({
  widgetKey,
  mainPanel,
  listItems,
  disabled = false,
}: StatsWidgetProps) {
  const items: CollapseProps["items"] = [
    {
      key: widgetKey,
      label: mainPanel,
      children: listItems,
      collapsible: disabled ? "disabled" : "header",
    },
  ];

  return (
    <Card className={styles.widget} styles={{ body: { padding: 0 } }}>
      <Collapse
        ghost
        items={items}
        expandIconPlacement="end"
        className={styles.collapse}
        onChange={(keys) => {
          console.log("clicked widget:", widgetKey, keys);
        }}
        expandIcon={({ isActive }) =>
          disabled ? null : (
            <span
              className={`${styles.expandIcon} ${
                isActive ? styles.expandIconActive : ""
              }`}
            >
              {isActive ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </span>
          )
        }
      />
    </Card>
  );
}

export default StatsWidget;
