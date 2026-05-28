import { Form, Select } from "antd";
import type { Currency } from "../../types/containerProfile.types";

type CurrencySelectProps = {
  currencies: Currency[];
};

function CurrencySelect({ currencies }: CurrencySelectProps) {
  const form = Form.useFormInstance();

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
    <>
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
    </>
  );
}

export default CurrencySelect;
