import { Flex } from "antd";
import style from "./Header.module.css";
import AccountButton from "../../ui/accountButton/AccountButton";
import { useProfileStore } from "../../../store/profileStore";
import MenuButton from "../../ui/menuButton/MenuButton";

function Header() {
  const user = useProfileStore((state) => state.user);
  const account = useProfileStore((state) => state.account);

  function handleBalanceClick() {
    console.log("click");
  }

  if (!user || !account) return null;

  return (
    <Flex align="center" justify={"space-between"} vertical={false}>
      <AccountButton
        amount={account.amount}
        currency={account.currencySymbol}
        conversionFactor={account.conversionFactor}
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
