import { Flex, Grid } from "antd";
import style from "./TwoPanels.module.css";

type TwoPanelsProps = {
  left: React.ReactNode;
  right: React.ReactNode;
};

function TwoPanels({ left, right }: TwoPanelsProps) {
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const isMobile = !screens.sm;

  return (
    <Flex className={style.container} vertical={false}>
      <div
        className={`${style.left} ${
          isMobile ? style["left--mobile"] : style["left--desctop"]
        }`}
      >
        {left}
      </div>
      {right && <div className={style.right}>{right}</div>}
    </Flex>
  );
}

export default TwoPanels;
