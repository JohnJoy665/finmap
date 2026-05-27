import { AutoComplete, Form } from "antd";
import type { RuleObject } from "antd/es/form";
import { useEffect, useState } from "react";
import type { City } from "../../types/profileForm.types";
import { getCities } from "../../api/getCities";

type CityAutoCompleteProps = {
  cities: City[];
  setCities: (cities: City[]) => void;
};

function CityAutoComplete({ cities, setCities }: CityAutoCompleteProps) {
  const [citySearchStr, setCitySearchStr] = useState("");

  const form = Form.useFormInstance();
  const countryCode = Form.useWatch("countryCode", form);
  const languageCode = Form.useWatch("languageCode", form);

  useEffect(() => {
    if (citySearchStr.length < 3 || countryCode === "") {
      return;
    }

    const time = setTimeout(async () => {
      const citiesData = await getCities({
        searchString: citySearchStr,
        langCode: languageCode,
        countryCode: countryCode,
      });
      setCities(citiesData.data);
    }, 500);

    return () => {
      clearTimeout(time);
    };
  }, [citySearchStr, languageCode, countryCode, setCities]);

  function handleCityChange(value) {
    form.setFieldsValue({
      cityName: value,
      cityId: 0,
    });
    setCitySearchStr(value);
  }

  function handleSelectCity(value, option: { value: string; cityId: number }) {
    form.setFieldsValue({
      cityName: value,
      cityId: option.cityId,
    });
  }

  function cityValidate(_: RuleObject, value: string) {
    const cityId = form.getFieldValue("cityId");

    if (!value || !cityId) {
      return Promise.reject(new Error("Выберите город"));
    }

    return Promise.resolve();
  }

  return (
    <>
      <Form.Item
        name="cityName"
        label="Выберите город"
        rules={[{ validator: cityValidate }]}
      >
        <AutoComplete
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

      <Form.Item name="cityId" hidden>
        <input />
      </Form.Item>
    </>
  );
}

export default CityAutoComplete;
