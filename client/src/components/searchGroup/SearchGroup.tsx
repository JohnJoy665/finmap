import { Input } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import styles from "./SearchGroup.module.css";

function SearchGroup() {
  return (
    <div className={styles.wrapper}>
      <Input
        placeholder="Поиск группы"
        variant="borderless"
        suffix={<SearchOutlined />}
        className={styles.input}
      />
    </div>
  );
}

export default SearchGroup;
