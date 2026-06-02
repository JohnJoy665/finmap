import { Collapse } from "antd";
import { DownOutlined } from "@ant-design/icons";
import SpendingsListItem, {
  SpendingsListItemActions,
} from "../spendingsListItem/SpendingsListItem";
import styles from "./SpendingsList.module.css";
import type { SpendingByGroupItem } from "../../../../../../../shared/types/spendings,types";

type SpendingsListProps = {
  spendings: SpendingByGroupItem[];
};

function SpendingsList({ spendings }: SpendingsListProps) {
  return (
    <Collapse
      accordion
      ghost
      bordered={false}
      expandIconPlacement="end"
      className={styles.collapse}
      expandIcon={({ isActive }) => (
        <DownOutlined
          className={`${styles.arrow} ${isActive ? styles.arrowActive : ""}`}
        />
      )}
      items={spendings.map((spending) => ({
        key: spending.id,
        className: styles.item,
        label: <SpendingsListItem spending={spending} />,
        children: <SpendingsListItemActions />,
      }))}
    />
  );
}

export default SpendingsList;
