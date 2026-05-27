import { Form, Input } from "antd";
import type { RuleObject } from "antd/es/form";
import { useRef } from "react";
import { getUniqName } from "../../api/getUniqName";

function UniqUserNameInput() {
  const uniqNameTimerRef = useRef<number | null>(null);
  const uniqNameResolveRef = useRef<(() => void) | null>(null);

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
  );
}

export default UniqUserNameInput;
