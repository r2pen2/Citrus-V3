// Library imports
import { Button } from "@mui/material";

// Component imports
import { DashboardOweCards } from "../../resources/OweCards";
import { TransactionList } from "../../resources/Transactions";
import { Breadcrumbs } from "../../resources/Navigation";
import { SectionTitle } from "../../resources/Labels";
import { HomeFriendsList } from "../../resources/Friends";
import { HomeGroupList } from "../../resources/Groups";

// API imports
import { RouteManager } from "../../../api/routeManager";

export default function Home() {

  return (
    <div className="d-flex flex-column gap-10">
      <Breadcrumbs path="Dashboard/Home" />
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