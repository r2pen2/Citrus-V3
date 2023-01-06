import { GroupList } from "../../resources/Groups";
import { Breadcrumbs } from "../../resources/Navigation";
import { UserRelation } from "../../../api/db/objectManagers/userManager";
import { useState, useEffect } from "react";
import { SortSelector } from "../../resources/Misc"; 

export default function UserGroups() {
  
  const [sortingScheme, setSortingScheme] = useState(UserRelation.sortingSchemes.BALANCE);

  return (
    <div className="d-flex flex-column gap-10">
      <Breadcrumbs path="Dashboard/Groups" />
      <SortSelector setSortingScheme={setSortingScheme} sortingScheme={sortingScheme}/>
    </div>
  );
}