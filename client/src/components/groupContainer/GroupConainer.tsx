import { useNavigate } from "react-router-dom";
import { categoryIcons } from "../../assets/icons/categoryIcons";
import { groups } from "../../mocks/groups";
import AddGroupContent from "../addGroupContent/AddGroupContent";
import GroupButton from "../groupButton/GroupButton";
import GroupItemContent from "../GroupItemContent/GroupItemContent";
import styles from "./GroupContainer.module.css";
import type { Group } from "../../types/groups.type";

function GroupContainer() {
  const navigate = useNavigate();
  const renderGroups = groups.map((group) => {
    return (
      <GroupButton
        key={group.id}
        id={group.id}
        onClick={() => handleAddPurchase(group)}
      >
        <GroupItemContent
          title={group.title}
          amount={group.amount}
          Icon={categoryIcons[group.category_icon]}
        />
      </GroupButton>
    );
  });

  function handleAddPurchase(group: Group) {
    navigate("/app/operations/purchase", {
      state: {
        mode: "existingGroup",
        group,
      },
    });
  }

  function handleCreateGroup() {
    navigate("/app/operations/purchase", {
      state: {
        mode: "newGroup",
      },
    });
  }

  return (
    <>
      <div className={styles.container}>
        <GroupButton onClick={handleCreateGroup} key={"0"} id={"0"}>
          <AddGroupContent />
        </GroupButton>
        {renderGroups}
      </div>
      ;
    </>
  );
}

export default GroupContainer;
