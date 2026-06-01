import { Flex } from "antd";
import style from "./Header.module.css";
import { useProfileStore } from "../../../store/profileStore";
import MenuButton from "../../ui/menuButton/MenuButton";
import AccountSelector from "../../../features/selectAccount/components/accountSelector/AccountSelector";

function Header() {
  const user = useProfileStore((state) => state.user);

  if (!user) return null;

  return (
    <Flex align="center" justify={"space-between"} vertical={false}>
      <AccountSelector />
      <Flex
        className={style.header__right}
        align="center"
        gap={"small"}
        justify="flex-end"
      >
        <div className={style["header__user-container"]}>
          <p>{user.name}</p>
        </div>
        <MenuButton />
      </Flex>
    </Flex>
  );
}

export default Header;
