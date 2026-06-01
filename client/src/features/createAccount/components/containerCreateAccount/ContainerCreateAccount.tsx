import { useEffect, useState } from "react";
import { useProfileStore } from "../../../../store/profileStore";
import CreateAccountForm from "../createAccountForm/CreateAccountForm";
import { getCurrencies } from "../../../userSetup/api/getCurrencies";
import type { Currency } from "../../../../shared/types/currency.types";

function ContainerCreateAccount() {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const langCode = useProfileStore((store) => store.settings?.languageCode);

  useEffect(() => {
    async function getAccountsData() {
      if (!langCode) return;
      const response = await getCurrencies({ langCode });
      setCurrencies(response.data);
    }

    getAccountsData();
  }, [langCode]);

  if (currencies.length === 0) return;

  return (
    <>
      <CreateAccountForm currencies={currencies} />
    </>
  );
}

export default ContainerCreateAccount;
