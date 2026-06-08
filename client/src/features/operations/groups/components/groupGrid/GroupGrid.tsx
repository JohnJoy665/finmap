import { useNavigate } from "react-router-dom";
import { categoryIcons } from "../../../../../assets/icons/categoryIcons";

import AddGroupCardIcon from "../addGroupCardIcon/AddGroupCardIcon";

import GroupCardContent from "../groupItemContent/GroupCardContent";
import styles from "./GroupGrid.module.css";

import GroupCard from "../groupCard/GroupCard";
import type { Group } from "../../../../../shared/types/group.types";
import { useGroupStrore } from "../../../../../store/groupStore";
import { useProfileStore } from "../../../../../store/profileStore";
import { useState } from "react";
import { Button } from "antd";

function GroupGrid() {
  const [showAll, setShowAll] = useState(false);
  const VISIBLE_CARDS_COUNT = 12;
  const VISIBLE_GROUPS_COUNT = VISIBLE_CARDS_COUNT - 1;

  const groups = useGroupStrore((store) => store.groups);

  const conversionFactor = useProfileStore(
    (store) => store.account?.conversionFactor
  );

  const currencySymbol = useProfileStore(
    (store) => store.account?.currencySymbol
  );
  const navigate = useNavigate();

  if (!conversionFactor || !currencySymbol) return;

  const visibleGroups = showAll
    ? groups
    : groups.slice(0, VISIBLE_GROUPS_COUNT);

  const renderGroups = visibleGroups.map((group) => {
    return (
      <GroupCard
        key={group.id}
        id={group.id}
        onClick={() => handleAddPurchase(group)}
        amount={group.amount}
      >
        <GroupCardContent
          title={group.title}
          amount={group.amount}
          Icon={categoryIcons[group.category_icon]}
          isConverted={group.is_converted}
          categoryCode={group.category_icon}
          conversionFactor={conversionFactor}
        />
      </GroupCard>
    );
  });

  function handleAddPurchase(group: Group) {
    navigate("/app/operations/spendings", {
      state: {
        group,
      },
    });
  }

  function handleCreateGroup() {
    navigate("/app/operations/spendings");
  }

  return (
    <>
      <div className={styles.container}>
        <GroupCard onClick={handleCreateGroup} key={"0"} id={"0"}>
          <AddGroupCardIcon />
        </GroupCard>
        {renderGroups}
      </div>
      {groups.length > VISIBLE_GROUPS_COUNT && (
        <Button
          block
          type="link"
          className={styles.showMore}
          onClick={() => setShowAll((prev) => !prev)}
        >
          {showAll ? "Скрыть" : "Показать все"}
        </Button>
      )}
    </>
  );
}

export default GroupGrid;
