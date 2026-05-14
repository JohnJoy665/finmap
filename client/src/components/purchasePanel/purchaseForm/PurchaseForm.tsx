import { Button, Form, Flex } from "antd";
import { useNavigate } from "react-router-dom";
import AmountInput from "../amountInput/AmountInput";
import InputText from "../inputText/InputText";
import styles from "./PurchaseForm.module.css";
import CategorySelect from "../categorySelect/CategorySelect";
import { useState } from "react";
import FieldTemplate from "../fieldTemplate/FieldTemplate";
import { createGroup } from "../../../api/operationsApi";
import { useProfileStore } from "../../../store/profileStore";

type Group = {
  groupName?: string;
  groupId?: string;
  isShowingTemplate?: boolean;
};

type Category = {
  categoryName?: string;
  categoryId?: string;
  isShowingTemplate?: boolean;
};

type PurchaseFormProps = {
  group?: Group;
  category?: Category;
};

type formSubmit = {
  amount: string;
  category: number;
  groupName: string;
};

function PurchaseForm({ group, category }: PurchaseFormProps) {
  const [isEditingCategory, setIsEditingCategory] = useState(
    category !== undefined
  );

  const userAccount = useProfileStore((state) => state.account);
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

  function handleFinish(values: formSubmit) {
    async function getNewGroup() {
      const newGroup = await createGroup({
        amount: values.amount,
        groupName: values.groupName,
        categoryId: values.category,
        conversionFactor: 100,
        currencyCode: userAccount.currencyCode,
        accountId: userAccount.id,
      });

      updateAccountAmount(newGroup.data.accountAmount);
    }

    getNewGroup();
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

export default PurchaseForm;
