import { Breadcrumbs } from "../../resources/Navigation";
import { UserRelation } from "../../../api/db/objectManagers/userManager";
import { useState, useEffect } from "react";
import { SortSelector } from "../../resources/Misc"; 
import { SectionTitle } from "../../resources/Labels"; 
import { GroupsList } from "../../resources/Groups"; 
import { SessionManager } from "../../../api/sessionManager";
import { DBManager } from "../../../api/db/dbManager";
import { CircularProgress, Button } from "@mui/material";

export default function UserGroups() {
  
  const [sortingScheme, setSortingScheme] = useState(UserRelation.sortingSchemes.BALANCE);
  const [groupManagers, setGroupManagers] = useState({managers: [], fetched: false});

  const currentUserManager = SessionManager.getCurrentUserManager();
  
  useEffect(() => {
    async function fetchRelations() {
        const userGroups = await currentUserManager.getGroups();
        let newGroupManagers = [];
        for (const groupId of userGroups) {
          const groupManager = DBManager.getGroupManager(groupId);
          await groupManager.fetchData();
          newGroupManagers.push(groupManager);
        }
        setGroupManagers({managers: newGroupManagers, fetched: true});
    }
    fetchRelations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  return (
    <div className="d-flex flex-column gap-10">
      <Breadcrumbs path="Dashboard/Groups" />
      <SortSelector setSortingScheme={setSortingScheme} sortingScheme={sortingScheme}/>
      <SectionTitle title="Groups">
        <Button variant="contained" onClick={() => window.location = "/dashboard/group/add"}>Add Groups</Button>
      </SectionTitle>
      { groupManagers.fetched ? <GroupsList groupManagers={groupManagers.managers} /> : <section className="d-flex flex-row justify-content-center w-100 align-items-center"><CircularProgress/></section> }
    </div>
  );
}