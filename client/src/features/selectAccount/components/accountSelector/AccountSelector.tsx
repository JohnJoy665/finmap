import { useCallback, useState } from "react";
import { Dropdown } from "antd";
import AccountButton from "../../../../components/ui/accountButton/AccountButton";
import { useAccountsStore } from "../../../../store/accountsStore";
import { useProfileStore } from "../../../../store/profileStore";
import AccountsDropdown from "../accountsDropdown/AccountsDropdown";
import { useLocation } from "react-router-dom";

function AccountSelector() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const activeAccount = useProfileStore((store) => store.account);
  const accounts = useAccountsStore((store) => store.accounts);

  const stablePopupRender = useCallback(
    () => (
      <AccountsDropdown
        accounts={accounts}
        activeAccount={activeAccount}
        onClose={() => setOpen(false)}
        pathname={pathname}
      />
    ),
    [accounts, activeAccount, pathname]
  );

  if (!activeAccount) return null;

  return (
    <Dropdown
      open={open}
      onOpenChange={setOpen}
      trigger={["click"]}
      placement="bottomRight"
      popupRender={stablePopupRender}
    >
      <AccountButton
        amount={activeAccount.amount}
        name={activeAccount.name}
        currency={activeAccount.currencySymbol}
        conversionFactor={activeAccount.conversionFactor}
      />
    </Dropdown>
  );
}

export default AccountSelector;
