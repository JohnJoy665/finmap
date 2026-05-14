import { Flex } from "antd";
// import { useAuthStore } from "../../store/authStore";
import MenuButton from "../menuButton/MenuButton";
import style from "./Header.module.css";
import BalanceButton from "../balanceButton/BalanceButton";
import { useProfileStore } from "../../store/profileStore";

function Header() {
  const user = useProfileStore((state) => state.user);
  const account = useProfileStore((state) => state.account);

  function handleBalanceClick() {
    console.log("click");
  }

  if (!user || !account) return null;

  return (
    <Flex align="center" justify={"space-between"} vertical={false}>
      <BalanceButton
        amount={account.amount}
        currency={account.currencySymbol}
        onClick={handleBalanceClick}
      />
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
