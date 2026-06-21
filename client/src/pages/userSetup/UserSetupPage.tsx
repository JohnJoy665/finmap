import { Typography } from "antd";
import ContainerProfile from "../../features/userSetup/components/containerProfile/ContainerProfile";
import styles from "./UserSetupPage.module.css";
import Paragraph from "antd/es/typography/Paragraph";

const { Title, Text } = Typography;

function UserSetupPage() {
  return (
    <div className={styles.container}>
      <Title className={styles.title} level={3}>
        Заполните профиль
      </Title>
      <ContainerProfile />
      <Paragraph className={styles.subText}>
        <Text type="secondary">
          * Для выбора текущей валюты необходимо добавить счет. Начальный
          остаток указывать необязательно — его можно будет внести или изменить
          позднее в настройках счета. При этом для более точного построения
          прогнозов рекомендуется указать актуальное состояние счета.
        </Text>
      </Paragraph>
    </div>
  );
}

export default UserSetupPage;
