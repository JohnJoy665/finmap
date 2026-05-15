import { Flex } from "antd";
import { PlusOutlined } from "@ant-design/icons";

function AddGroupCardIcon() {
  return (
    <Flex align="center" justify="center">
      <PlusOutlined
        style={{ color: "var(--ant-color-success)", fontSize: 18 }}
      />
    </Flex>
  );
}

export default AddGroupCardIcon;
