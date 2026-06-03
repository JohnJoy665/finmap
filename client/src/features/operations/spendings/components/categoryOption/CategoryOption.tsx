import { Flex } from "antd";
import type { LucideIcon } from "lucide-react";

// import styles from "./CategoryOption.module.css";

type CategoryOptionType = {
  categoryName: string;
  Icon: LucideIcon;
  iconSize?: number;
  iconColor?: string;
  textSize?: number;
  height?: number;
};

function CategoryOption({
  categoryName,
  Icon,
  iconSize = 18,
  iconColor = "var(--app-accent)",
  textSize = 15,
  height = 32,
}: CategoryOptionType) {
  return (
    <Flex
      align="center"
      gap={10}
      style={{
        height: `${height}px`,
      }}
    >
      <Icon size={iconSize} color={iconColor} />
      <span
        style={{
          fontSize: textSize,
          lineHeight: `${textSize + 6}px`,
          color: "var(--ant-color-text-secondary);",
        }}
      >
        {categoryName}
      </span>
    </Flex>
  );
}

export default CategoryOption;
