import { Button, Form, Flex } from "antd";
import { useNavigate } from "react-router-dom";
import AmountInput from "../amountInput/AmountInput";
import InputText from "../inputText/InputText";
import styles from "./SpendingsForm.module.css";
import CategorySelect from "../categorySelect/CategorySelect";
import { useState } from "react";
import FieldTemplate from "../fieldTemplate/FieldTemplate";

import { useProfileStore } from "../../../../../store/profileStore";
import { createNewGroupWithSpending } from "../../api/createNewGroupWithSpending";
import type {
  SpendingFormValues,
  SpendingsFormCategory,
  SpendingsFormGroup,
} from "../../types/spendings.types";
import { createNewSpending } from "../../api/createNewSpending";

type SpendingsFormProps = {
  group?: SpendingsFormGroup;
  category?: SpendingsFormCategory;
};

function SpendingsForm({ group, category }: SpendingsFormProps) {
  const [isEditingCategory, setIsEditingCategory] = useState(
    category !== undefined
  );

  const updateAccountAmount = useProfileStore(
    (state) => state.updateAccountAmount
  );

  const [form] = Form.useForm();
  const selectedCategory = Form.useWatch("category", form);

  const navigate = useNavigate();

  function handleEditCategory() {
    setIsEditingCategory(false);

    form.setFieldsValue({
      category: category.categoryId,
    });
  }

  function handleCancel() {
    navigate("/app/operations");
    form.resetFields();
  }

  function handleFinish(values: SpendingFormValues) {
    async function getNewGroup() {
      const newGroup = await createNewGroupWithSpending({
        amount: values.amount,
        groupName: values.groupName,
        categoryId: values.category,
      });

      updateAccountAmount(newGroup.data.accountAmount);
    }

    async function getNewSpendng() {
      const newSpending = await createNewSpending({
        amount: values.amount,
        groupId: group.groupId,
        categoryId: values.category,
      });

      updateAccountAmount(newSpending.data.accountAmount);
    }

    if (!values.groupName) {
      getNewSpendng();
    } else {
      getNewGroup();
    }

    handleCancel();
  }

  function amountValidate(_, value: string) {
    if (!value) {
      return Promise.reject(new Error("Введите сумму покупки"));
    }

    if (!/^\d+(\.\d{1,2})?$/.test(value)) {
      return Promise.reject(new Error("Некорректный формат суммы"));
    }

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
      onFinish={handleFinish}
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
        <Button block danger onClick={handleCancel}>
          Назад
        </Button>

        <Button block type="primary" htmlType="submit">
          Сохранить
        </Button>
      </Flex>
    </Form>
  );
}

export default SpendingsForm;
