import { useNavigate } from "react-router-dom";
import { categoryIcons } from "../../../../../assets/icons/categoryIcons";

import AddGroupCardIcon from "../addGroupCardIcon/AddGroupCardIcon";

import GroupCardContent from "../groupItemContent/GroupCardContent";
import styles from "./GroupGrid.module.css";

import GroupCard from "../groupCard/GroupCard";
import type { Group } from "../../../../../shared/types/group.types";
import { useGroupStrore } from "../../../../../store/groupStore";

function GroupGrid() {
  const groups = useGroupStrore((store) => store.groups);
  const navigate = useNavigate();
  const renderGroups = groups.map((group) => {
    return (
      <GroupCard
        key={group.id}
        id={group.id}
        onClick={() => handleAddPurchase(group)}
      >
        <GroupCardContent
          title={group.title}
          amount={group.amount}
          Icon={categoryIcons[group.category_icon]}
        />
      </GroupCard>
    );
  });

  function handleAddPurchase(group: Group) {
    navigate("/app/operations/spendings", {
      state: {
        mode: "existingGroup",
        group,
      },
    });
  }

  function handleCreateGroup() {
    navigate("/app/operations/spendings", {
      state: {
        mode: "newGroup",
      },
    });
  }

  return (
    <>
      <div className={styles.container}>
        <GroupCard onClick={handleCreateGroup} key={"0"} id={"0"}>
          <AddGroupCardIcon />
        </GroupCard>
        {renderGroups}
      </div>
      ;
    </>
  );
}

export default GroupGrid;
