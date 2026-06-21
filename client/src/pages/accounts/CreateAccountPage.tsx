import { Typography } from "antd";
import ContainerCreateAccount from "../../features/createAccount/components/containerCreateAccount/ContainerCreateAccount";

const { Text } = Typography;

function CreateAccountPage() {
  return (
    <>
      <Typography.Title level={2}>Добавьте счет</Typography.Title>

      <ContainerCreateAccount />

      <Typography.Paragraph style={{ marginTop: 16, marginBottom: 0 }}>
        <Text type="secondary">
          * Вы можете добавить несколько счетов, в том числе несколько счетов в
          одной валюте. Указанная сумма отражает состояние счета на выбранную
          дату, поэтому при существенных изменениях курса валют рекомендуется
          учитывать актуальность внесенных данных. Создать счет можно и без
          указания начального остатка — сумму можно будет добавить или изменить
          позднее в настройках счета.
        </Text>
      </Typography.Paragraph>
    </>
  );
}

export default CreateAccountPage;
