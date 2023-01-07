// Style imports
import "./dashboard.scss";

// Library imports
import { Backdrop } from "@mui/material"
import { Route, Routes } from "react-router-dom";
import { useState, useEffect } from 'react'

// Component imports
import BottomNav from "./navigation/BottomNav";
import People from "./tabs/People";
import NewTransaction from "./tabs/NewTransaction";
import Shortcut from "./tabs/Shortcut";
import UserGroups from "./tabs/UserGroups";
import AllTransactions from "./tabs/AllTransactions";
import Transaction from "./routes/Transaction";
import Group from "./routes/Group";
import User from "./routes/User";

// API imports
import { RouteManager } from "../../api/routeManager";

export default function Dashboard() {

  RouteManager.setTitleOrRedirectToLogin("Dashboard");

  const [activeTab, setActiveTab] = useState(RouteManager.getHash() ? RouteManager.getHash() : "home");                 // Active tab for content selection

  // Enable back button!
  useEffect(() => {
    window.onpopstate = e => {
      setActiveTab(RouteManager.getHash() ? RouteManager.getHash() : "home")
    };
  });

  function renderTab() {
    switch(activeTab) {
      case "people":
        return <People />;
      case "new-transaction":
        return <NewTransaction />;
      case "groups":
        return <UserGroups />;
      case "transactions":
        return <AllTransactions />;
      default:
        return <People />;
    }
  }
  
  return (
    <div className="dashboard-container d-flex flex-column align-items-center" style={{paddingBottom: "100px"}}>
      <div className="dashboard-pane ">
        <Routes>
          <Route path="*" element={ renderTab() }/>
          <Route path="/transactions/*" element={<Transaction />}/>
          <Route path="/group/*" element={<Group />}/>
          <Route path="/user/*" element={<User />}/>
        </Routes>
      </div>
      <BottomNav />
    </div>
  );
}
