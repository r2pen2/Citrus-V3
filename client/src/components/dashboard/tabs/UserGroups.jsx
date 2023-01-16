import { Breadcrumbs } from "../../resources/Navigation";
import { UserRelation } from "../../../api/db/objectManagers/userManager";
import { useState, useEffect } from "react";
import { SectionTitle } from "../../resources/Labels"; 
import { GroupsList } from "../../resources/Groups"; 
import { SessionManager } from "../../../api/sessionManager";
import { DBManager } from "../../../api/db/dbManager";
import { Button } from "@mui/material";

import { GroupCardSkeleton } from "../../resources/Groups"

export default function UserGroups() {
  
  const [sortingScheme, setSortingScheme] = useState(UserRelation.sortingSchemes.BALANCE);
  const [groupState, setGroupState] = useState({ids: SessionManager.getCurrentUserGroups(), managers: [], fetched: false});

  const currentUserManager = SessionManager.getCurrentUserManager();
  
  useEffect(() => {
    async function fetchRelations() {
        let newGroupManagers = [];
        for (const groupId of groupState.ids) {
          const groupManager = DBManager.getGroupManager(groupId);
          await groupManager.fetchData();
          newGroupManagers.push(groupManager);
        }
        setGroupState({ids: groupState.ids, managers: newGroupManagers, fetched: true});
    }
    fetchRelations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  function renderSkeleton() {
    return groupState.ids.map((id) => {
      return <GroupCardSkeleton key={id} />
    })
  }

  return (
    <div className="d-flex flex-column gap-10">
      <Breadcrumbs path="Dashboard/Groups" />
      <SectionTitle title="Groups">
        <Button variant="contained" onClick={() => window.location = "/dashboard/group/add"}>Add Groups</Button>
      </SectionTitle>
      { groupState.fetched ? <GroupsList groupManagers={groupState.managers} /> : renderSkeleton() }
    </div>
  );
}