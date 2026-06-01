import { useEffect } from "react";
import GroupGrid from "../../features/operations/groups/components/groupGrid/GroupGrid";
import SearchGroup from "../../features/operations/groups/components/searchGroup/SearchGroup";
import { getGroupsRequest } from "../../features/operations/groups/api/getGroups";
import { useGroupStrore } from "../../store/groupStore";
import { useProfileStore } from "../../store/profileStore";

function Operations() {
  const setGroups = useGroupStrore((store) => store.setGroups);
  const activeAccountId = useProfileStore((store) => store.account?.id);

  useEffect(() => {
    if (!activeAccountId) return;
    async function getGroups() {
      const groups = await getGroupsRequest();
      setGroups(groups.data);
    }

    getGroups();
  }, [setGroups, activeAccountId]);

  return (
    <>
      <SearchGroup />
      <GroupGrid />
    </>
  );
}

export default Operations;
