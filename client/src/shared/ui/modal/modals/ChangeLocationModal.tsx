import { Button, Flex, Form } from "antd";
import BaseModal from "../ui/BaseModal";
import { useModalStore } from "../model/modalStore";
import type { ChangeLocationModalProps } from "../model/modal.types";
import CountryAutoComplete from "../../../../features/userSetup/components/countryAutoComplete/CountryAutoComplete";
import CityAutoComplete from "../../../../features/userSetup/components/cityAutoComplete/CityAutoComplete";
import { useState } from "react";

type ChangeLocationFormValues = {
  countryCode: string;
  countryName: string;
  cityId: number;
  cityName: string;
  languageCode: string;
};

type Props = ChangeLocationModalProps & {
  modalId: string;
  open: boolean;
};

function ChangeLocationModal({
  modalId,
  open,
  countryCode,
  countryName,
  cityId,
  cityName,
  languageCode,
  content,
  onChangeLocation,
}: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);

  const [form] = Form.useForm<ChangeLocationFormValues>();
  const closeModalById = useModalStore((store) => store.closeModalById);

  function handleCancel() {
    closeModalById(modalId);
  }

  function handleFieldsChange() {
    const hasErrors = form
      .getFieldsError()
      .some((field) => field.errors.length > 0);

    setIsSubmitDisabled(hasErrors);
  }

  async function handleSubmit(values: ChangeLocationFormValues) {
    try {
      setIsLoading(true);

      await onChangeLocation({
        countryCode: values.countryCode,
        cityId: values.cityId,
      });

      closeModalById(modalId);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <BaseModal
      open={open}
      title="Мы обнаружили новую геолокацию"
      onCancel={handleCancel}
      footer={null}
      keepAlive={false}
    >
      {content}

      <Form
        autoComplete="off"
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onFieldsChange={handleFieldsChange}
        initialValues={{
          countryCode,
          countryName,
          cityId,
          cityName,
          languageCode,
        }}
      >
        <CountryAutoComplete />
        <CityAutoComplete />
        <Form.Item name="languageCode" hidden>
          <input />
        </Form.Item>
      </Form>

      <Flex justify="flex-end" gap={8} style={{ marginTop: 24 }}>
        <Button onClick={handleCancel}>Отмена</Button>

        <Button
          type="primary"
          loading={isLoading}
          disabled={isSubmitDisabled}
          onClick={() => form.submit()}
        >
          Да
        </Button>
      </Flex>
    </BaseModal>
  );
}

export default ChangeLocationModal;
