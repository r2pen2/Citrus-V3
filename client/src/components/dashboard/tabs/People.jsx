
// Library imports
import { useState, useEffect, useContext } from "react"

// Component imports
import { Breadcrumbs } from "../../resources/Navigation";
import { PeopleList } from "../../resources/PeopleResources";
import { SortSelector } from "../../resources/PeopleResources";
import { UsersContext } from "../../../App";

// API imports
import { SessionManager } from "../../../api/sessionManager";
import { UserRelation } from "../../../api/db/objectManagers/userManager";

const currentUserManager = SessionManager.getCurrentUserManager();

export default function People() {

    const { usersData, setUsersData } = useContext(UsersContext);
  

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
        console.log(usersData);
        let allRelations = null;
        let friendsList = null;
        if (usersData[SessionManager.getUserId()]) {
            allRelations = usersData[SessionManager.getUserId()].relations;
            friendsList = usersData[SessionManager.getUserId()].friends;
        } else {
            allRelations = await currentUserManager.getRelations();
            friendsList = await currentUserManager.getFriends();
            const newData = { ...usersData };
            newData[SessionManager.getUserId()] = currentUserManager.data;
            setUsersData(newData); 
        }
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