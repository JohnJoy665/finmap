import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import styles from "./SettingAccountPage.module.css";
import { getAccountInitialization } from "../../../features/settingAccount/api/getAccountInitialization";
import { useModalStore } from "../../../shared/ui/modal";
import { useAccountsStore } from "../../../store/accountsStore";
import { initializeAccount } from "../../../features/settingAccount/api/initializeAccount";
import { useProfileStore } from "../../../store/profileStore";
import { Typography } from "antd";
import ContainerSettingAccount from "../../../features/settingAccount/components/containerSettingAccount/ContainerSettingAccount";

const { Title } = Typography;

type SettingAccountPageState = {
  accountId: string | null;
};

function SettingAccountPage() {
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as SettingAccountPageState | null;
  const accountId = state?.accountId ?? null;

  const accounts = useAccountsStore((store) => store.accounts);
  const openModal = useModalStore((store) => store.openModal);

  const activeAccount = useProfileStore((state) => state.account?.id);

  const updateListAmountAccounts = useAccountsStore(
    (store) => store.updateListAmountAccounts
  );

  const updateProfileAmount = useProfileStore(
    (state) => state.updateProfileAmount
  );

  const hasOpenedInitModalRef = useRef(false);

  function handleCancelInitModal() {
    navigate("/app", { replace: true });
  }

  function openInitModal({
    accountId,
    conversionFactor,
    currencyCode,
    currencySymbol,
  }: {
    accountId: string;
    conversionFactor: number;
    currencyCode: string;
    currencySymbol: string;
  }) {
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
          const amountMinor = String(Number(amount) * conversionFactor);

          console.log({
            accountId,
            amount,
            amountMinor,
          });

          const response = await initializeAccount({
            accountId,
            amount: amountMinor,
          });
          console.log(response?.data);

          if (response?.data.isInitialized) {
            setIsInitialized(true);
            if (activeAccount === response.data.accountId) {
              updateProfileAmount(response.data.amount);
            }
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
  }

  useEffect(() => {
    let isCancelled = false;

    async function loadAccountInitialization() {
      if (!accountId) {
        setIsLoading(false);
        return;
      }

      const currentAccount = accounts.find((account) => {
        return account.id === accountId;
      });

      if (!currentAccount) {
        if (accounts.length === 0) return;
        setIsLoading(false);
        navigate("/app", { replace: true });
        return;
      }

      try {
        setIsLoading(true);

        const response = await getAccountInitialization({
          accountId,
        });

        if (isCancelled) return;

        if (response.data.isInitialized) {
          setIsInitialized(true);
          return;
        }

        setIsInitialized(false);

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
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadAccountInitialization();

    return () => {
      isCancelled = true;
    };
  }, [accountId, accounts, navigate]);

  if (!accountId) {
    return <Navigate to="/app" replace />;
  }

  return (
    // <>
    //   <p>test setting account page</p>
    //   <p>{accountId}</p>
    //   <p>{isLoading ? "Загрузка..." : "Загрузка завершена"}</p>
    //   <p>{`${isInitialized ? "Инициализировано" : "Не инициализировано"}`}</p>
    // </>
    <div className={styles.container}>
      {/* <Title className={styles.title} level={3}>
        Настройка счета
      </Title> */}
      <ContainerSettingAccount accountId={accountId} />
    </div>
  );
}

export default SettingAccountPage;
