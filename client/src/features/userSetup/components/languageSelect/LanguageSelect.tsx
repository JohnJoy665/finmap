import { Form, Select } from "antd";
import type { Languages } from "../../types/containerProfile.types";

type LanguageSelect = {
  setSelectedLanguageCode: (value: string) => void;
  languages: Languages[];
};

function LanguageSelect({
  setSelectedLanguageCode,
  languages,
}: LanguageSelect) {
  function handleLanguageChange(values: string) {
    setSelectedLanguageCode(values);
  }

  return (
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
  );
}

export default LanguageSelect;
