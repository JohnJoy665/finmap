import { Form, InputNumber } from "antd";
import type { InputNumberProps } from "antd";
import type { RuleObject } from "antd/es/form";
import type { KeyboardEvent, ClipboardEvent } from "react";

type AmountInputProps = {
  lable?: string;
};

function AmountInput({ lable }: AmountInputProps) {
  const form = Form.useFormInstance();
  const currencySymbol = Form.useWatch("currencySymbol", form) || "";

  const formatter: InputNumberProps<string>["formatter"] = (value) => {
    if (value === undefined || value === null || value === "") {
      return "";
    }

    const [start, end] = `${value}`.split(".");
    const formattedStart = start.replace(/\B(?=(\d{3})+(?!\d))/g, " ");

    const formattedValue = end ? `${formattedStart}.${end}` : formattedStart;

    return currencySymbol
      ? `${currencySymbol} ${formattedValue}`
      : formattedValue;
  };

  const parser: InputNumberProps<string>["parser"] = (value) => {
    const cleanedValue = (value || "")
      .replace(currencySymbol, "")
      .replace(/\s/g, "")
      .replace(/,/g, ".")
      .replace(/[^\d.]/g, "");

    const [integerPart, ...decimalParts] = cleanedValue.split(".");

    if (decimalParts.length === 0) {
      return integerPart;
    }

    return `${integerPart}.${decimalParts.join("")}`;
  };

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const pastedText = event.clipboardData.getData("text");

    const isValidPaste = /^[\d.,\s]+$/.test(pastedText);

    if (!isValidPaste) {
      event.preventDefault();
    }
  }

  function amountValidate(_: RuleObject, value: string | null | undefined) {
    if (value === null || value === undefined || value === "") {
      return Promise.resolve();
    }

    const amount = Number(value);

    if (Number.isNaN(amount)) {
      return Promise.reject(new Error("Введите корректную сумму"));
    }

    if (amount < 0) {
      return Promise.reject(new Error("Сумма не может быть отрицательной"));
    }

    if (amount > 999999999999) {
      return Promise.reject(new Error("Сумма слишком большая"));
    }

    return Promise.resolve();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const allowedControlKeys = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Tab",
      "Home",
      "End",
    ];

    if (allowedControlKeys.includes(event.key)) {
      return;
    }

    if (event.ctrlKey || event.metaKey) {
      return;
    }

    const isDigit = /^\d$/.test(event.key);
    const isDecimalSeparator = event.key === "." || event.key === ",";

    if (!isDigit && !isDecimalSeparator) {
      event.preventDefault();
    }
  }

  return (
    <Form.Item
      name="accountAmount"
      label={lable || null}
      validateTrigger="onChange"
      getValueFromEvent={(value: string | null) => value ?? ""}
      rules={[
        {
          validator: amountValidate,
        },
      ]}
    >
      <InputNumber<string>
        stringMode
        precision={2}
        controls={false}
        formatter={formatter}
        parser={parser}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder="Введите сумму"
        style={{ width: "100%" }}
      />
    </Form.Item>
  );
}

export default AmountInput;
