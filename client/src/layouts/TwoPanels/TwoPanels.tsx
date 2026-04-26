import { Flex } from "antd";
import style from './TwoPanels.module.css'

type TwoPanelsProps = {
  left: React.ReactNode;
  right: React.ReactNode;
};

function TwoPanels({left, right}: TwoPanelsProps) {
  return (
    <Flex  className={style.container} vertical={false}>
      <div className={style.left}>{left}</div>
      <div className={style.right}>{right}</div>
    </Flex>
  );
}

export default TwoPanels;
