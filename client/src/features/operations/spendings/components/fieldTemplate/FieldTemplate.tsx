import { Flex } from "antd";
import styles from "./FieldTemplate.module.css";
import { EditOutlined } from "@ant-design/icons";

type FieldTemplateProps = {
  fieldName: string;
  onClick?: () => void;
  label: string;
};

function FieldTemplate({ fieldName, onClick, label }: FieldTemplateProps) {
  return (
    <Flex className={styles.container}>
      <div
        onClick={onClick}
        style={{ cursor: onClick ? "pointer" : "default" }}
      >
        <p className={styles["field-template"]}>{fieldName}</p>
      </div>
      <span className={styles.field__message}>{label}</span>
      {onClick && <EditOutlined className={styles["field-icon"]} />}
    </Flex>
  );
}

export default FieldTemplate;
