
// Library imports
import { useState, useEffect } from "react"

// Component imports
import { Breadcrumbs } from "../../resources/Navigation";
import { PeopleList } from "../../resources/PeopleResources";
import { SortSelector } from "../../resources/PeopleResources";

// API imports
import { SessionManager } from "../../../api/sessionManager";
import { UserRelation } from "../../../api/db/objectManagers/userManager";

const currentUserManager = SessionManager.getCurrentUserManager();

export default function People() {

  const [sortingScheme, setSortingScheme] = useState(UserRelation.sortingSchemes.BALANCE);
  const [relations, setRelations] = useState({
      friends: [],
      others: [],
      fetched: false,
  });
  const [filter, setFilter] = useState({
    friends: true,
    others: true
  });
  
  useEffect(() => {
      async function fetchRelations() {
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
              fetched: true,
          })
      }
      fetchRelations();
  }, []);

  return (
    <div className="d-flex flex-column gap-10"> 
        <Breadcrumbs path="Dashboard/People" />
        <SortSelector setSortingScheme={setSortingScheme} sortingScheme={sortingScheme} setFilter={setFilter} filter={filter}/>
        <PeopleList sortingScheme={sortingScheme} relations={relations} filter={filter} />
    </div>
  );
}