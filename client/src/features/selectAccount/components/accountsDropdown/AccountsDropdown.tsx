import { Button } from "antd";
import type { Account } from "../../../../shared/types/account.types";
import styles from "./AccountsDropdown.module.css";
import { useNavigate } from "react-router-dom";
import React from "react";
import { Settings } from "lucide-react";
import { changeCurrentAccount } from "../../../createAccount/api/changeCurrentAccount";
import { useProfileStore } from "../../../../store/profileStore";
import { fromMinorToMajorNormalize } from "../../../../utils/toMinorAmount";

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

  function setActiveAccount(accountId: string) {
    if (accountId === activeAccount?.id) return;

    async function getChangeAccount() {
      const currentAccount = await changeCurrentAccount({
        accountId: accountId,
      });
      changeProfileAccount(currentAccount.data);
      onClose();
    }

    getChangeAccount();
  }

  function handleClickCreateAccount() {
    if (pathname.includes("/app/accounts/create")) return;
    navigate("/app/accounts/create");
    onClose();
  }

  function handleClickAccountSetting(accountId: string) {
    navigate("/app/accounts/setting", {
      state: { accountId },
    });
    onClose();
  }

  return (
    <div className={styles.dropdown}>
      {accounts.map((account) => {
        const formattedAmount = fromMinorToMajorNormalize(
          account.amount,
          account.conversionFactor
        );

        const isActive = account.id === activeAccount?.id;

        return (
          <div key={account.id} className={styles.accountItem}>
            <button
              type="button"
              className={styles.accountButton}
              onClick={() => setActiveAccount(account.id)}
            >
              <span className={styles.accountInfo}>
                <span className={styles.accountHeader}>
                  <span className={styles.currency}>
                    {account.currencySymbol === account.currencyCode
                      ? account.currencyCode
                      : account.currencySymbol + " " + account.currencyCode}
                  </span>

                  {isActive && <span className={styles.active}>Активный</span>}
                </span>

                {account.name && (
                  <span className={styles.accountName} title={account.name}>
                    {account.name}
                  </span>
                )}
              </span>

              <span className={styles.amount}>{formattedAmount}</span>
            </button>

            <button
              type="button"
              className={styles.settingButton}
              onClick={() => handleClickAccountSetting(account.id)}
              aria-label="Настройки счета"
            >
              <Settings size={16} strokeWidth={2.2} />
            </button>
          </div>
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
