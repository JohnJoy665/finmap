import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useCallback, useEffect, useRef } from "react";

import styles from "./SettingAccountPage.module.css";
import { getAccountInitialization } from "../../../features/settingAccount/api/getAccountInitialization";
import { useModalStore } from "../../../shared/ui/modal";
import { useAccountsStore } from "../../../store/accountsStore";
import { initializeAccount } from "../../../features/settingAccount/api/initializeAccount";
import { useProfileStore } from "../../../store/profileStore";
import ContainerSettingAccount from "../../../features/settingAccount/components/containerSettingAccount/ContainerSettingAccount";

type SettingAccountPageState = {
  accountId: string | null;
};

function SettingAccountPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as SettingAccountPageState | null;
  const accountId = state?.accountId ?? null;

  const currentAccount = useAccountsStore((store) =>
    store.accounts.find((account) => account.id === accountId)
  );

  const accountsCount = useAccountsStore((store) => store.accounts.length);

  const openModal = useModalStore((store) => store.openModal);

  const updateListAmountAccounts = useAccountsStore(
    (store) => store.updateListAmountAccounts
  );

  const updateProfileAmount = useProfileStore(
    (state) => state.updateProfileAmount
  );

  const hasOpenedInitModalRef = useRef(false);

  const handleCancelInitModal = useCallback(() => {
    navigate("/app", { replace: true });
  }, [navigate]);

  const openInitModal = useCallback(
    ({
      accountId,
      conversionFactor,
      currencyCode,
      currencySymbol,
    }: {
      accountId: string;
      conversionFactor: number;
      currencyCode: string;
      currencySymbol: string;
    }) => {
      if (hasOpenedInitModalRef.current) return;

      hasOpenedInitModalRef.current = true;

      openModal({
        type: "setAccountCurrentAmount",
        props: {
          accountId,
          currencyCode,
          currencySymbol,
          conversionFactor,
          onSubmit: async ({ accountId, amount }) => {
            const amountMinor = String(
              Math.round(Number(amount) * conversionFactor)
            );

            const response = await initializeAccount({
              accountId,
              amount: amountMinor,
            });

            if (response?.data.isInitialized) {
              updateProfileAmount({
                accountId: response.data.accountId,
                newAmount: response.data.amount,
              });

              updateListAmountAccounts([
                {
                  accountId,
                  amount: response.data.amount,
                },
              ]);
            }
          },
          onCancel: handleCancelInitModal,
        },
      });
    },
    [
      openModal,
      updateProfileAmount,
      updateListAmountAccounts,
      handleCancelInitModal,
    ]
  );

  useEffect(() => {
    hasOpenedInitModalRef.current = false;
  }, [accountId]);

  useEffect(() => {
    let isCancelled = false;

    async function loadAccountInitialization() {
      if (!accountId) return;

      if (!currentAccount) {
        if (accountsCount === 0) return;

        navigate("/app", { replace: true });
        return;
      }

      try {
        const response = await getAccountInitialization({
          accountId,
        });

        if (isCancelled) return;

        if (response.data.isInitialized) return;

        openInitModal({
          accountId: response.data.accountId,
          conversionFactor: currentAccount.conversionFactor,
          currencyCode: currentAccount.currencyCode,
          currencySymbol: currentAccount.currencySymbol,
        });
      } catch (error) {
        if (isCancelled) return;

        console.log(error);
        navigate("/app", { replace: true });
      }
    }

    loadAccountInitialization();

    return () => {
      isCancelled = true;
    };
  }, [
    accountId,
    currentAccount?.id,
    currentAccount?.conversionFactor,
    currentAccount?.currencyCode,
    currentAccount?.currencySymbol,
    accountsCount,
    navigate,
    openInitModal,
  ]);

  if (!accountId) {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className={styles.container}>
      <ContainerSettingAccount accountId={accountId} />
    </div>
  );
}

export default SettingAccountPage;
