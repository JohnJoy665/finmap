import { Typography } from "antd";
import ContainerCreateAccount from "../../features/createAccount/components/containerCreateAccount/ContainerCreateAccount";
import styles from "./CreateAccountPage.module.css";

const { Text, Title, Paragraph } = Typography;

function CreateAccountPage() {
  return (
    <>
      <Title className={styles.title} level={3}>
        Добавьте счет
      </Title>

      <ContainerCreateAccount />

      <Paragraph style={{ marginTop: 16, marginBottom: 0 }}>
        <Text type="secondary">
          * Вы можете добавить несколько счетов, в том числе несколько счетов в
          одной валюте. Указанная сумма отражает состояние счета на выбранную
          дату, поэтому при существенных изменениях курса валют рекомендуется
          учитывать актуальность внесенных данных. Создать счет можно и без
          указания начального остатка — сумму можно будет добавить или изменить
          позднее в настройках счета.
        </Text>
      </Paragraph>
    </>
  );
}

export default CreateAccountPage;
