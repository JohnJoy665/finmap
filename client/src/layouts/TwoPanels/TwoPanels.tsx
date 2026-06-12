import { Flex } from "antd";
import style from "./TwoPanels.module.css";
import useIsMobile from "../../hooks/useIsMobile";

type TwoPanelsProps = {
  left: React.ReactNode;
  right: React.ReactNode;
};

function TwoPanels({ left, right }: TwoPanelsProps) {
  const { isMobile } = useIsMobile();

  return (
    <Flex className={style.container} vertical={false}>
      <div
        className={`${style.left} ${isMobile ? style["left--mobile"] : style["left--desctop"]}`}
      >
        {left}
      </div>
      {right && <div className={style.right}>{right}</div>}
    </Flex>
  );
}

export default TwoPanels;
