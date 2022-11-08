// Library imports
import { Button } from "@mui/material";
import { useState } from "react"

// Component imports
import { DashboardOweCards } from "../../resources/OweCards";
import { TransactionList } from "../../resources/Transactions";
import { Breadcrumbs } from "../../resources/Navigation";
import { SectionTitle } from "../../resources/Labels";
import { HomeFriendsList } from "../../resources/Friends";
import { HomeGroupList } from "../../resources/Groups";

// API imports
import { RouteManager } from "../../../api/routeManager";
import { UserRelation } from "../../../api/db/objectManagers/userManager";

export default function People() {

  const [sortingFunction, setSortingFunction] = useState(UserRelation.sortByBalance);

  return (
    <div className="d-flex flex-column gap-10"> 
      <Breadcrumbs path="Dashboard/People" />
      <DashboardOweCards />
      <div>
        <SectionTitle title="Recent Transactions">
          <Button variant="contained" onClick={() => RouteManager.redirectWithHash("dashboard", "transactions")}>View All Transactions</Button>
        </SectionTitle>
        <TransactionList
          numDisplayed={5}
        />
      </div>
      <div>
        <SectionTitle title="Friends">
          <Button variant="contained" onClick={() => RouteManager.redirectWithHash("dashboard", "friends")}>Add Friends</Button>
        </SectionTitle>
        <HomeFriendsList />
      </div>
      <div>
        <SectionTitle title="Groups">
          <Button variant="contained" onClick={() => RouteManager.redirect("/dashboard/groups/add")}>Add Groups</Button>
        </SectionTitle>
        <HomeGroupList />
      </div>
    </div>
  );
}