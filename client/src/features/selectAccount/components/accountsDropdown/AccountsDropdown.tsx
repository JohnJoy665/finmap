import { Button } from "antd";
import type { Account } from "../../../../shared/types/account.types";
import styles from "./AccountsDropdown.module.css";
import { useNavigate } from "react-router-dom";
import React from "react";
import { changeCurrentAccount } from "../../../createAccount/api/changeCurrentAccount";
import { useProfileStore } from "../../../../store/profileStore";
import { useFiltersStore } from "../../../../store/filtersStore";

type AccountsDropdownProps = {
  accounts: Account[];
  activeAccount: Account | null;
  onClose: () => void;
  pathname: string;
};

function AccountsDropdown({
  accounts,
  activeAccount,
  onClose,
  pathname,
}: AccountsDropdownProps) {
  const navigate = useNavigate();
  const changeProfileAccount = useProfileStore(
    (store) => store.changeProfileAccount
  );
  const setGroupsFilter = useFiltersStore((store) => store.setGroupsFilter);

  function setActiveAccount(accountId: string) {
    if (accountId === activeAccount?.id) return;

    async function getChangeAccount() {
      const currentAccount = await changeCurrentAccount({
        accountId: accountId,
      });
      changeProfileAccount(currentAccount.data);
      setGroupsFilter(null);
      onClose();
    }

    getChangeAccount();
  }

  function handleClickCreateAccount() {
    if (pathname.includes("/app/accounts/create")) return;
    navigate("/app/accounts/create");
    onClose();
  }

  return (
    <div className={styles.dropdown}>
      {accounts.map((account) => {
        const displayAmount = Number(account.amount) / account.conversionFactor;
        const fraction = String(account.conversionFactor).length - 1;
        const formattedAmount = new Intl.NumberFormat("ru-RU", {
          minimumFractionDigits: fraction,
          maximumFractionDigits: fraction,
        }).format(displayAmount);

        const isActive = account.id === activeAccount?.id;

        return (
          <button
            key={account.id}
            type="button"
            className={styles.accountItem}
            onClick={() => setActiveAccount(account.id)}
          >
            <span className={styles.accountMain}>
              <span className={styles.currency}>
                {account.currencySymbol} {account.currencyCode}
              </span>

              {isActive && <span className={styles.active}>Активный</span>}
            </span>

            <span className={styles.amount}>{formattedAmount}</span>
          </button>
        );
      })}

      <div className={styles.footer}>
        <Button type="primary" block onClick={handleClickCreateAccount}>
          Добавить счет
        </Button>
      </div>
    </div>
  );
}

const MemoizedComponent = React.memo(AccountsDropdown);
export default MemoizedComponent;
