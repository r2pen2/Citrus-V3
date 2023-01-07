import { GroupList } from "../../resources/Groups";
import { Breadcrumbs } from "../../resources/Navigation";
import { UserRelation } from "../../../api/db/objectManagers/userManager";
import { useState, useEffect } from "react";
import { SortSelector } from "../../resources/Misc"; 
import { GroupsList } from "../../resources/Groups"; 
import { SessionManager } from "../../../api/sessionManager";
import { DBManager } from "../../../api/db/dbManager";

export default function UserGroups() {
  
  const [sortingScheme, setSortingScheme] = useState(UserRelation.sortingSchemes.BALANCE);
  const [groupManagers, setGroupManagers] = useState([]);

  const currentUserManager = SessionManager.getCurrentUserManager();
  
  useEffect(() => {
    async function fetchRelations() {
        const userGroups = await currentUserManager.getGroups();
        let newGroupManagers = [];
        for (const groupId of userGroups) {
          newGroupManagers.push(DBManager.getGroupManager(groupId));
        }
        setGroupManagers(newGroupManagers);
    }
    fetchRelations();
  }, []);
  
  return (
    <div className="d-flex flex-column gap-10">
      <Breadcrumbs path="Dashboard/Groups" />
      <SortSelector setSortingScheme={setSortingScheme} sortingScheme={sortingScheme}/>
      <GroupsList groupManagers={groupManagers} />
    </div>
  );
}