import { useState } from "react";
import { Card, Collapse } from "antd";
import type { CollapseProps } from "antd";

import styles from "./StatsWidget.module.css";
import { ChevronDown, ChevronUp } from "lucide-react";

type StatsWidgetProps = {
  mainPanel: React.ReactNode;
  listItems: React.ReactNode;
  disabled?: boolean;
};

function StatsWidget({
  mainPanel,
  listItems,
  disabled = false,
}: StatsWidgetProps) {
  const [open, setOpen] = useState(false);

  const items: CollapseProps["items"] = [
    {
      key: "category-stats",
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
        activeKey={!disabled && open ? ["category-stats"] : []}
        onChange={(keys) => {
          if (disabled) return;

          setOpen(keys.length > 0);
        }}
        expandIconPlacement="end"
        className={styles.collapse}
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
