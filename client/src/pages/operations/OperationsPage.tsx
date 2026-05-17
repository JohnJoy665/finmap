import { useEffect } from "react";
import GroupGrid from "../../features/operations/groups/components/groupGrid/GroupGrid";
import SearchGroup from "../../features/operations/groups/components/searchGroup/SearchGroup";
import { getGroupsRequest } from "../../features/operations/groups/api/getGroups";
import { useGroupStrore } from "../../store/groupStore";

function Operations() {
  const setGroups = useGroupStrore((store) => store.setGroups);

  useEffect(() => {
    async function getGroups() {
      const groups = await getGroupsRequest();
      setGroups(groups.data);
    }

    getGroups();
  }, [setGroups]);

  return (
    <>
      <SearchGroup />
      <GroupGrid />
    </>
  );
}

export default Operations;
