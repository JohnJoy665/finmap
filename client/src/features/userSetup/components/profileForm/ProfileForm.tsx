import { Button, Form } from "antd";

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
import type { Currency } from "../../types/containerProfile.types";
import CurrencySelect from "../currencySelect/CurrencySelect";
import AmountInput from "../amountInput/AmountInput";

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
  console.log("reload");

  const [form] = Form.useForm<ProfileFormValues>();

  const clearProfile = useProfileStore((store) => store.clearProfile);
  const navigate = useNavigate();

  function handleSubmit(values: ProfileFormValues) {
    console.log(values);
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
        });

        if (newUserSettingId) {
          navigate("/app", {
            replace: true,
          });

          clearProfile();
        }
      } catch (error) {
        console.log(error);
      }
    }

    getNewProfile();
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

      <AmountInput />

      <Button type="primary" htmlType="submit">
        Сохранить
      </Button>
    </Form>
  );
}

export default ProfileForm;
