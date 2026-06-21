import { Button, Form, Flex } from "antd";
import AmountInput from "../amountInput/AmountInput";
import InputText from "../inputText/InputText";
import styles from "./SpendingsForm.module.css";
import CategorySelect from "../categorySelect/CategorySelect";
import { useState } from "react";
import FieldTemplate from "../fieldTemplate/FieldTemplate";

import type {
  SpendingFormValues,
  SpendingsFormCategory,
  SpendingsFormGroup,
} from "../../types/spendingsForm.types";

import type { RuleObject } from "antd/es/form";

type SpendingsFormProps = {
  handleSubmit: (values: SpendingFormValues) => void;
  handleCancel: () => void;
  group?: SpendingsFormGroup;
  category?: SpendingsFormCategory;
  isSubmitting: boolean;
};

function SpendingsForm({
  handleSubmit,
  handleCancel,
  group,
  category,
  isSubmitting,
}: SpendingsFormProps) {
  const [isEditingCategory, setIsEditingCategory] = useState(
    category !== undefined
  );
  const [form] = Form.useForm();
  const selectedCategory = Form.useWatch("category", form);

  function handleEditCategory() {
    if (!category) return;
    setIsEditingCategory(false);

    form.setFieldsValue({
      category: null,
    });
  }

  function handleClouse() {
    form.resetFields();
    handleCancel();
  }

  function amountValidate(_: RuleObject, value: string) {
    if (!value) {
      return Promise.reject(new Error("Введите сумму покупки"));
    }

    // if (!/^\d+(\.\d{1,2})?$/.test(value)) {
    //   return Promise.reject(new Error("Некорректный формат суммы"));
    // }

    if (Number(value) <= 0) {
      return Promise.reject(new Error("Сумма должна быть больше 0"));
    }

    return Promise.resolve();
  }

  return (
    <Form
      className={styles.form}
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
    >
      {group ? (
        <FieldTemplate label={"Название группы"} fieldName={group.groupName} />
      ) : (
        <Form.Item
          className={styles.form__item}
          name={"groupName"}
          help={null}
          rules={[
            { required: true, message: "Заполните название группы" },
            { max: 25, message: "Достигнуто макисмальное число символов" },
          ]}
        >
          <InputText autoFocus={true} label={"Название группы"} />
        </Form.Item>
      )}

      {category && isEditingCategory ? (
        <FieldTemplate
          fieldName={category.categoryName}
          onClick={handleEditCategory}
          label={"Категория группы (можно изменить категорию покупки)"}
        />
      ) : (
        <Form.Item
          className={styles.form__item}
          name={"category"}
          help={null}
          rules={[{ required: true, message: "Выберите категорию" }]}
        >
          <CategorySelect
            label={
              !category || selectedCategory === category.categoryId
                ? "Категория группы"
                : "Категория покупки"
            }
          />
        </Form.Item>
      )}

      <Form.Item
        className={styles.form__item}
        name="amount"
        rules={[{ validator: amountValidate }]}
      >
        <AmountInput label={"Сумма покупки"} />
      </Form.Item>

      <Flex gap="middle">
        <Button block onClick={handleClouse}>
          Назад
        </Button>

        <Button
          disabled={isSubmitting}
          loading={isSubmitting}
          block
          type="primary"
          htmlType="submit"
        >
          Сохранить
        </Button>
      </Flex>
    </Form>
  );
}

export default SpendingsForm;
