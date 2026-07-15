import { Input } from "antd";
import { CloseOutlined, SearchOutlined } from "@ant-design/icons";
import styles from "./SearchGroup.module.css";
import type { ChangeEvent } from "react";
import { useGroupStore } from "../../../../../store/groupStore";

function SearchGroup() {
  const searchString = useGroupStore((store) => store.searchString);
  const setSearchString = useGroupStore((store) => store.setSearchString);

  function setSearchGroup(event: ChangeEvent<HTMLInputElement>) {
    setSearchString(event.target.value);
  }

  function clearSearchGroup() {
    setSearchString("");
  }

  return (
    <div className={styles.wrapper}>
      <Input
        value={searchString}
        onChange={setSearchGroup}
        placeholder="Поиск группы"
        variant="borderless"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        inputMode="search"
        name="group-search"
        suffix={
          searchString ? (
            <CloseOutlined
              className={styles.clearIcon}
              onClick={clearSearchGroup}
            />
          ) : (
            <SearchOutlined className={styles.searchIcon} />
          )
        }
        className={styles.input}
      />
    </div>
  );
}

export default SearchGroup;
