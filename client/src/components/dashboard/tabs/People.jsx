// Library imports
import { useState, useEffect } from "react"

// Component imports
import { Breadcrumbs } from "../../resources/Navigation";
import { SortSelector, PeopleList } from "../../resources/PeopleResources";

// API imports
import { SessionManager } from "../../../api/sessionManager";
import { UserRelation } from "../../../api/db/objectManagers/userManager";

const currentUserManager = SessionManager.getCurrentUserManager();

export default function People() {

  const [sortingScheme, setSortingScheme] = useState(UserRelation.sortingSchemes.BALANCE);
  const [relations, setRelations] = useState({
      friends: [],
      others: [],
  });
  
  useEffect(() => {
      async function fetchRelations() {
          await currentUserManager.fetchData();
          const allRelations = await currentUserManager.getRelations();
          const friendsList = await currentUserManager.getFriends();
          const friends = [];
          const others = [];
          Object.entries(allRelations).forEach(([key, value]) => {
              const listItem = value;
              listItem["userId"] = key;
              if (friendsList.includes(key)) {
                  friends.push(listItem);
              } else {
                  others.push(listItem);
              }
          })
          setRelations({
              friends: friends,
              others: others,
          })
      }
      fetchRelations();
  }, []);

  return (
    <div className="d-flex flex-column gap-10"> 
      <Breadcrumbs path="Dashboard/People" />
      <SortSelector setSortingScheme={setSortingScheme} sortingScheme={sortingScheme}/>
      <PeopleList sortingScheme={sortingScheme} relations={relations} />
    </div>
  );
}