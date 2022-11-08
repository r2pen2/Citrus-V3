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
import OweOneDirection from "./tabs/OweOneDirection";
import AllTransactions from "./tabs/AllTransactions";
import Bookmarks from "./tabs/Bookmarks";
import Transaction from "./routes/Transaction";
import Groups from "./routes/Groups";
import Friends from "./routes/Friends";

// API imports
import { RouteManager } from "../../api/routeManager";

export default function Dashboard() {

  RouteManager.setTitleOrRedirectToLogin("Dashboard");

  const [shortcutActive, setShortcutActive] = useState(false);        // Whether or not new transaction shortcut is active
  const [bookmarksDeployed, setBookmarksDeployed] = useState(false);  // Whether or not bookmarks are displayed in shortcut
  const [activeTab, setActiveTab] = useState(RouteManager.getHash() ? RouteManager.getHash() : "home");                 // Active tab for content selection

  /**
   * Close shortcut on mouseup
   * @param {Event} event mouseEvent that triggered this function
   */
   function closeShortcut(event) {
    if (event.type === "mouseup") {
      setShortcutActive(false);
      setBookmarksDeployed(false);
    }
  }

  // Enable back button!
  useEffect(() => {
    window.onpopstate = e => {
      setActiveTab(RouteManager.getHash() ? RouteManager.getHash() : "home")
    };
  });

  /**
   * Render shortcut page when active
   * @returns {Component} shortcut page
   */
  function renderShortcut() {
    // Don't render shortcut on the new transaction page
    const location = window.location.toString();
    const lastSlash = location.lastIndexOf('/');
    const afterSlash = location.substring(lastSlash + 1);
    if (afterSlash === "new-transaction") { 
      return; 
    } else {
      return (
        <Backdrop
          sx={{ color: '#fff', zIndex: 2 }}
          open={shortcutActive}
          onClick={() => {setShortcutActive(false);}}
          onMouseUp={(e) => closeShortcut(e)}
        >
          <Shortcut bookmarksDeployed={bookmarksDeployed} setBookmarksDeployed={setBookmarksDeployed}/>
        </Backdrop>
      ) 
    }
  }

  function renderTab() {
    switch(activeTab) {
      case "people":
        return <People />;
      case "new-transaction":
        return <NewTransaction />;
      case "bookmarks":
        return <Bookmarks />;
      case "groups":
        return <UserGroups />;
      case "owe-positive":
        return <OweOneDirection positive={true}/>;
      case "owe-negative":
        return <OweOneDirection positive={false}/>;
      case "transactions":
        return <AllTransactions />;
      default:
        return <People />;
    }
  }
  
  return (
    <div className="dashboard-container d-flex flex-column align-items-center" style={{paddingBottom: "100px"}}>
      { renderShortcut() }
      <div className="dashboard-pane">
        <Routes>
          <Route path="*" element={ renderTab() }/>
          <Route path="/transactions/*" element={<Transaction />}/>
          <Route path="/groups/*" element={<Groups />}/>
          <Route path="/friends/*" element={<Friends />}/>
        </Routes>
      </div>
      <BottomNav setShortcutActive={setShortcutActive} setBookmarksDeployed={setBookmarksDeployed}/>
    </div>
  );
}
