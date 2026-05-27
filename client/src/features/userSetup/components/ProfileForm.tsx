import { AutoComplete, Button, Form, Input, Select } from "antd";
import { useEffect, useRef, useState } from "react";
import { getCountries } from "../api/getCountries";
import { getCities } from "../api/getCities";
import type { RuleObject } from "antd/es/form";

import { createProfile } from "../api/createProfile";
import { useNavigate } from "react-router-dom";
import { useProfileStore } from "../../../store/profileStore";
import { getUniqName } from "../api/getUniqName";

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
  uniqUserName?: string;
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
  const [countries, setCountries] = useState<Country[]>([]);
  const [countrySearchStr, setCountrySearchStr] = useState("");

  const [cities, setCities] = useState<City[]>([]);
  const [citySearchStr, setCitySearchStr] = useState("");

  const [form] = Form.useForm<ProfileFormValues>();
  const isGeoFieldsDisabled = !languageCode;

  const selectedCountryCode = Form.useWatch("countryCode", form);

  const navigate = useNavigate();

  const clearProfile = useProfileStore((store) => store.clearProfile);

  const uniqNameTimerRef = useRef<number | null>(null);
  const uniqNameResolveRef = useRef<(() => void) | null>(null);

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

    form.validateFields(["countryName"]);
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

  async function uniqNameValidate(_: RuleObject, value: string) {
    const normalizedValue = value?.trim();

    if (!normalizedValue) {
      throw new Error("Введите имя");
    }

    if (normalizedValue.length < 3) {
      throw new Error("Минимум 3 символа");
    }

    if (normalizedValue.length > 30) {
      throw new Error("Максимум 30 символов");
    }

    if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(normalizedValue)) {
      throw new Error("Допустимы латинские символы, цифры, -, _");
    }

    if (uniqNameTimerRef.current) {
      clearTimeout(uniqNameTimerRef.current);
    }

    if (uniqNameResolveRef.current) {
      uniqNameResolveRef.current();
    }

    return new Promise<void>((resolve, reject) => {
      uniqNameResolveRef.current = resolve;
      uniqNameTimerRef.current = setTimeout(async () => {
        try {
          const response = await getUniqName({
            uniqUserName: normalizedValue,
          });

          if (!response.data.isAvailable) {
            reject(new Error("Такой логин уже занят"));
          }

          resolve();
        } catch {
          reject(new Error("Не удалось проверить логин"));
        } finally {
          uniqNameResolveRef.current = null;
          uniqNameTimerRef.current = null;
        }
      }, 400);
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

      <Form.Item
        name="uniqUserName"
        label="Придумайте уникальное имя"
        validateTrigger="onChange"
        rules={[
          {
            validator: uniqNameValidate,
          },
        ]}
      >
        <Input placeholder="Введите уникальное имя" />
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
