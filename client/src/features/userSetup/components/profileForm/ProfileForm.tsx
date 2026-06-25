import { Button, Flex, Form } from "antd";

import { createProfile } from "../../api/createProfile";
import { useNavigate } from "react-router-dom";
import { useProfileStore } from "../../../../store/profileStore";
import type {
  Language,
  ProfileFormValues,
} from "../../types/profileForm.types";
import UniqUserNameInput from "../uniqUserNameInput/UniqUserNameInput";
import CountryAutoComplete from "../countryAutoComplete/CountryAutoComplete";
import CityAutoComplete from "../cityAutoComplete/CityAutoComplete";
import LanguageSelect from "../languageSelect/LanguageSelect";
import CurrencySelect from "../../../../shared/components/currencySelect/CurrencySelect";
import AmountInput from "../../../../shared/components/amountInput/AmountInput";
import type { Currency } from "../../../../shared/types/currency.types";
import { useAuthStore } from "../../../../store/authStore";
import { useFiltersStore } from "../../../../store/filtersStore";
import { useGroupStrore } from "../../../../store/groupStore";
import { usePurchaseStore } from "../../../../store/purchaseStore";

type ProfileFormProps = {
  languages: Language[];
  languageCode: string;
  countryCode?: string;
  countryName?: string;
  cityId?: number;
  cityName?: string | null;
  currencies: Currency[];
  setSelectedLanguageCode: (value: string) => void;
};

function ProfileForm({
  languages,
  languageCode,
  countryCode,
  countryName,
  cityId,
  cityName,
  currencies,
  setSelectedLanguageCode,
}: ProfileFormProps) {
  const [form] = Form.useForm<ProfileFormValues>();
  const timezone: string = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const clearProfile = useProfileStore((store) => store.clearProfile);
  const navigate = useNavigate();

  function handleSubmit(values: ProfileFormValues) {
    async function getNewProfile() {
      try {
        const newUserSettingId = await createProfile({
          languageCode: values.languageCode,
          countryCode: values.countryCode,
          countryName: values.countryName,
          cityId: values.cityId,
          cityName: values.cityName,
          currencyCode: values.currencyCode,
          uniqUserName: values.uniqUserName,
          accountAmount: values.accountAmount,
          timezone,
        });

        if (newUserSettingId) {
          navigate("/app", {
            replace: true,
          });

          clearProfile();
        }
      } catch (error) {
        console.log(error); // TODO ПОДУМАТЬ, что тут будет
      }
    }

    getNewProfile();
  }

  function handleLogout() {
    useAuthStore.getState().logout();
    useProfileStore.getState().reset();
    useFiltersStore.getState().reset();
    useGroupStrore.getState().reset();
    usePurchaseStore.getState().reset();
  }

  function handleClouse() {
    handleLogout();
  }

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        uniqUserName: undefined,
        languageCode,
        countryName: countryName || "",
        countryCode: countryCode || "",
        cityId: cityId || 0,
        cityName: cityName || "",
        currencyName: undefined,
        currencyCode: "",
        currencySymbol: "",
        accountAmount: "",
        conversionFactor: 100,
      }}
      onFinish={handleSubmit}
    >
      <LanguageSelect
        setSelectedLanguageCode={setSelectedLanguageCode}
        languages={languages}
      />
      <UniqUserNameInput />
      <CountryAutoComplete />
      <CityAutoComplete />
      <CurrencySelect currencies={currencies} />

      <AmountInput lable="Какая сумма на счете?" />

      <Flex gap="middle">
        <Button block onClick={handleClouse}>
          Назад
        </Button>
        <Button block type="primary" htmlType="submit">
          Сохранить
        </Button>
      </Flex>
    </Form>
  );
}

export default ProfileForm;
