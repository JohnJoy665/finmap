import { useNavigate } from "react-router-dom";
import { categoryIcons } from "../../../../../assets/icons/categoryIcons";

import AddGroupCardIcon from "../addGroupCardIcon/AddGroupCardIcon";

import GroupCardContent from "../groupItemContent/GroupCardContent";
import styles from "./GroupGrid.module.css";

import GroupCard from "../groupCard/GroupCard";
import type { Group } from "../../../../../shared/types/group.types";
import { useGroupStrore } from "../../../../../store/groupStore";
import { useProfileStore } from "../../../../../store/profileStore";
import { formatMoney } from "../../../../../utils/toMinorAmount";

function GroupGrid() {
  const groups = useGroupStrore((store) => store.groups);
  const conversionFactor = useProfileStore(
    (store) => store.account?.conversionFactor
  );

  const currencySymbol = useProfileStore(
    (store) => store.account?.currencySymbol
  );
  const navigate = useNavigate();

  if (!conversionFactor || !currencySymbol) return;

  const renderGroups = groups.map((group) => {
    return (
      <GroupCard
        key={group.id}
        id={group.id}
        onClick={() => handleAddPurchase(group)}
      >
        <GroupCardContent
          title={group.title}
          amount={
            group.amount !== null
              ? formatMoney(group.amount, conversionFactor)
              : "Нет данных"
          }
          Icon={categoryIcons[group.category_icon]}
          isConverted={group.is_converted}
          currencySymbol={currencySymbol}
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
    </>
  );
}

export default GroupGrid;
