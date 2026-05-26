import { AutoComplete, Button, Form, Select } from "antd";
import { useEffect, useState } from "react";
import { getCountries } from "../api/getCountries";
import { getCities } from "../api/getCities";
import type { RuleObject } from "antd/es/form";

type Language = {
  id: number;
  code: string;
  nameOriginal: string;
};

type ProfileFormValues = {
  languageCode?: string;
  countryName?: string;
  cityName?: string;
  countryCode?: string;
  cityId?: number;
  currencyName?: string;
  currencyCode: string;
};

type Country = {
  countryName: string;
  countryCode?: string;
  countryId?: number;
};

export type City = {
  cityId: number;
  cityName: string;
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
  const [countries, setCountries] = useState<Country[]>([]);
  const [countrySearchStr, setCountrySearchStr] = useState("");

  const [cities, setCities] = useState<City[]>([]);
  const [citySearchStr, setCitySearchStr] = useState("");

  const [form] = Form.useForm<ProfileFormValues>();
  const isGeoFieldsDisabled = !languageCode;

  const selectedCountryCode = Form.useWatch("countryCode", form);

  useEffect(() => {
    if (countrySearchStr.length < 3) return;

    const time = setTimeout(async () => {
      const countriesData = await getCountries({
        searchString: countrySearchStr,
        langCode: languageCode,
      });

      setCountries(countriesData.data);
    }, 500);

    return () => {
      clearTimeout(time);
    };
  }, [countrySearchStr, languageCode]);

  useEffect(() => {
    if (citySearchStr.length < 3 || selectedCountryCode === "") {
      return;
    }

    const time = setTimeout(async () => {
      const citiesData = await getCities({
        searchString: citySearchStr,
        langCode: languageCode,
        countryCode: selectedCountryCode,
      });
      setCities(citiesData.data);
    }, 500);

    return () => {
      clearTimeout(time);
    };
  }, [citySearchStr, languageCode, selectedCountryCode]);

  function handleSubmit(values: ProfileFormValues) {
    console.log("Profile form values:", values);
  }

  function handleLanguageChange(values: string) {
    setSelectedLanguageCode(values);
  }

  function handleCountryChange(value: string) {
    form.setFieldsValue({
      countryName: value,
      countryCode: "",
    });
    setCountrySearchStr(value);
  }

  function handleCityChange(value) {
    form.setFieldsValue({
      cityName: value,
      cityId: 0,
    });
    setCitySearchStr(value);
  }

  function handleSelectCountry(value) {
    const country = countries.find((country) => country.countryName === value);

    if (!country) return;

    setCities([]);

    form.setFieldsValue({
      countryName: country.countryName,
      countryCode: country.countryCode,
      cityId: 0,
      cityName: "",
    });
  }

  function handleSelectCity(value, option: { value: string; cityId: number }) {
    form.setFieldsValue({
      cityName: value,
      cityId: option.cityId,
    });
  }

  function countryValidate(_: RuleObject, value: string) {
    const countryCode = form.getFieldValue("countryCode");

    if (!value || !countryCode) {
      return Promise.reject(new Error("Выберите страну"));
    }

    return Promise.resolve();
  }

  function cityValidate(_: RuleObject, value: string) {
    const cityId = form.getFieldValue("cityId");

    if (!value || !cityId) {
      return Promise.reject(new Error("Выберите город"));
    }

    return Promise.resolve();
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
        languageCode,
        countryName: countryName || "",
        countryCode: countryCode || "",
        cityId: cityId || 0,
        cityName: cityName || "",
        currencyName: currencies[0].currencyName,
        currencyCode: currencies[0].currencyCode,
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

      <Form.Item
        name="countryName"
        label="Выберите страну"
        rules={[{ validator: countryValidate }]}
      >
        <AutoComplete
          disabled={isGeoFieldsDisabled}
          placeholder="Начните вводить название"
          onChange={handleCountryChange}
          onSelect={handleSelectCountry}
          options={countries.map((country) => ({
            value: country.countryName,
            countryCode: country.countryCode,
          }))}
        />
      </Form.Item>

      <Form.Item name="countryCode" hidden>
        <input />
      </Form.Item>

      <Form.Item
        name="cityName"
        label="Выберите город"
        rules={[{ validator: cityValidate }]}
      >
        <AutoComplete
          disabled={isGeoFieldsDisabled}
          placeholder="Начните вводить название"
          onSelect={handleSelectCity}
          onChange={handleCityChange}
          options={cities.map((city) => ({
            key: city.cityId,
            value: city.cityName,
            cityId: city.cityId,
          }))}
        />
      </Form.Item>

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

      <Form.Item name="cityId" hidden>
        <input />
      </Form.Item>

      <Button type="primary" htmlType="submit">
        Сохранить
      </Button>
    </Form>
  );
}

export default ProfileForm;
