import { AutoComplete, Form } from "antd";
import type { RuleObject } from "antd/es/form";
import { useEffect, useState } from "react";
import { getCountries } from "../../api/getCountries";
import type { Country } from "../../types/profileForm.types";

function CountryAutoComplete() {
  const form = Form.useFormInstance();
  const languageCode = Form.useWatch("languageCode");
  const [countries, setCountries] = useState<Country[]>([]);
  const [countrySearchStr, setCountrySearchStr] = useState("");

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

  function handleCountryChange(value: string) {
    form.setFieldsValue({
      countryName: value,
      countryCode: "",
      cityId: 0,
      cityName: "",
    });
    setCountrySearchStr(value);
  }

  function handleSelectCountry(value) {
    const country = countries.find((country) => country.countryName === value);

    if (!country) return;

    form.setFieldsValue({
      countryName: country.countryName,
      countryCode: country.countryCode,
      cityId: 0,
      cityName: "",
    });

    form.validateFields(["countryName"]);
  }

  function countryValidate(_: RuleObject, value: string) {
    const countryCode = form.getFieldValue("countryCode");

    if (!value || !countryCode) {
      return Promise.reject(new Error("Выберите страну"));
    }

    return Promise.resolve();
  }

  return (
    <>
      <Form.Item
        name="countryName"
        label="Выберите страну"
        rules={[{ validator: countryValidate }]}
      >
        <AutoComplete
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
    </>
  );
}

export default CountryAutoComplete;
