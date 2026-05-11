import { Grid } from "antd";

type BreakPoint = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";

function useIsMobile(breakPoint: BreakPoint = "sm") {
  const screens = Grid.useBreakpoint();

  const isMobile = !screens[breakPoint];

  return {
    isMobile,
  };
}

export default useIsMobile;
