import { useNavigate } from "react-router-dom";
import { categoryIcons } from "../../assets/icons/categoryIcons";
import { groups } from "../../mocks/groups";
import AddGroupContent from "../addGroupContent/AddGroupContent";
import GroupButton from "../groupButton/GroupButton";
import GroupItemContent from "../GroupItemContent/GroupItemContent";
import styles from "./GroupContainer.module.css";

function GroupContainer() {

    const navigate = useNavigate();
  const renderGroups = groups.map((group) => {
    return (
      <GroupButton key={group.id} id={group.id} onClick={handleAddPurchase}> 
        <GroupItemContent
          title={group.title}
          amount={group.amount}
          Icon={categoryIcons[group.category_icon]}
        />
      </GroupButton>
    );
  });

  function handleAddPurchase() {
    navigate("/app/operations/purchase")
  }

  return (
    <>
    <div className={styles.container}>
    <GroupButton onClick={handleAddPurchase} key={'0'} id={'0'}><AddGroupContent/></GroupButton>
        {renderGroups}
    </div>;
    </>
  )
}

export default GroupContainer;
