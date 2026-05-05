import { categoryIcons } from "../../assets/icons/categoryIcons";
import { groups } from "../../mocks/groups";
import AddGroupContent from "../addGroupContent/addGroupContent";
import GroupButton from "../groupButton/GroupButton";
import GroupItemContent from "../GroupItemContent/GroupItemContent";
import styles from "./GroupContainer.module.css";

function GroupContainer() {
  const renderGroups = groups.map((group) => {
    return (
      <GroupButton key={group.id} id={group.id}>
        <GroupItemContent
          title={group.title}
          amount={group.amount}
          Icon={categoryIcons[group.category_icon]}
        />
      </GroupButton>
    );
  });

  return (
    <>
    <div className={styles.container}>
    <GroupButton key={'1'} id={'1'}><AddGroupContent/></GroupButton>
        {renderGroups}
    </div>;
    </>
  )
}

export default GroupContainer;
