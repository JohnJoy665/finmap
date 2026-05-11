import { Flex } from "antd";
import { useAuthStore } from "../../store/authStore";
import MenuButton from "../menuButton/MenuButton";
import style from "./Header.module.css";
import BalanceButton from "../balanceButton/BalanceButton";

function Header() {
  const user = useAuthStore().user;

  function handleBalanceClick() {
    console.log("click");
  }

  return (
    <Flex align="center" justify={"space-between"} vertical={false}>
      <BalanceButton amount={0} currency={"RSD"} onClick={handleBalanceClick} />
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
