import { Button, Form, Select } from "antd";
import { useState } from "react";

import { createProfile } from "../../api/createProfile";
import { useNavigate } from "react-router-dom";
import { useProfileStore } from "../../../../store/profileStore";
import type { City, ProfileFormValues } from "../../types/profileForm.types";
import UniqUserNameInput from "../uniqUserNameInput/UniqUserNameInput";
import CountryAutoComplete from "../countryAutoComplete/CountryAutoComplete";
import CityAutoComplete from "../cityAutoComplete/CityAutoComplete";

type Language = {
  id: number;
  code: string;
  nameOriginal: string;
};

export type Currency = {
  currencyName: string;
  currencyCode: string;
  currencySymbol: string;
  conversionFactor: number;
};

type ProfileFormProps = {
  languages: Language[];
  languageCode?: string;

  countryCode?: string;
  countryName?: string;

  cityId?: number;
  cityName?: string;

  currencies: Currency[];

  setSelectedLanguageCode: (value: string) => void;
};

export type CreateProfileRequest = {
  languageCode: string;
  countryCode: string;
  countryName: string;
  cityId: number;
  cityName: string;
  currencyCode: string;
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

  const [cities, setCities] = useState<City[]>([]);
  const [form] = Form.useForm<ProfileFormValues>();

  const clearProfile = useProfileStore((store) => store.clearProfile);
  const navigate = useNavigate();

  function handleSubmit(values: ProfileFormValues) {
    console.log(values);
    return;
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

  function handleLanguageChange(values: string) {
    setSelectedLanguageCode(values);
  }

  function handleCurrencyChange(value: string) {
    const currency = currencies.find(
      (currency) => currency.currencyName === value
    );

    if (!currency) return;

    form.setFieldsValue({
      currencyName: value,
      currencyCode: currency.currencyCode,
    });
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
      }}
      onFinish={handleSubmit}
    >
      <Form.Item
        name="languageCode"
        label="Выберите язык"
        rules={[{ required: true, message: "Выберите язык" }]}
      >
        <Select
          onChange={handleLanguageChange}
          placeholder="Выберите язык"
          options={languages.map((language) => ({
            value: language.code,
            label: language.nameOriginal,
          }))}
        />
      </Form.Item>

      <UniqUserNameInput />
      <CountryAutoComplete setCities={setCities} />
      <CityAutoComplete cities={cities} setCities={setCities} />

      <Form.Item
        name="currencyName"
        label="Выберите валюту"
        rules={[{ required: true, message: "Выберите вылюту" }]}
      >
        <Select
          onChange={handleCurrencyChange}
          placeholder="Выберите валюту"
          options={currencies.map((currency) => ({
            value: currency.currencyName,
          }))}
        />
      </Form.Item>

      <Form.Item name="currencyCode" hidden>
        <input />
      </Form.Item>

      <Button type="primary" htmlType="submit">
        Сохранить
      </Button>
    </Form>
  );
}

export default ProfileForm;
