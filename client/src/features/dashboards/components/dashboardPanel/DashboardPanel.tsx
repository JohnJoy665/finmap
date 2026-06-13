import { Flex } from "antd";
import type { ReactNode } from "react";

type DashboardPanelProps = {
  children: ReactNode;
};
function DashboardPanel({ children }: DashboardPanelProps) {
  return (
    <Flex vertical gap={"large"}>
      {children}
    </Flex>
  );
}

export default DashboardPanel;
