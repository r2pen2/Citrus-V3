// Library imports
import { useState } from 'react';
import { AppBar, BottomNavigation, BottomNavigationAction } from "@mui/material"
import PersonIcon from '@mui/icons-material/Person';
import AddBoxIcon from '@mui/icons-material/AddBox';
import GroupsIcon from '@mui/icons-material/Groups';

// API imports
import { SessionManager } from "../../../api/sessionManager";
import { RouteManager } from "../../../api/routeManager";

// Temp. disable shortcut
const enableShortcut = false;

/**
 * Navigation tool on the bottom of the screen for all of the dashboard
 * @param {function} setShortcutActive function for setting whether or not the shortcut feature is current active
 * @param {function} setBookmarksDeployed function for setting whether or not bookmarks are displayed in shortcut
 * @param {function} setActiveTab function for setting which dashboard page is active 
 * @returns 
 */
export default function BottomNav({ setShortcutActive, setBookmarksDeployed }) {

  // Define constants
  const [value, setValue] = useState(RouteManager.getHash() ? RouteManager.getHash() : "home"); // Which element on the bottom is highlighted

  /**
   * Sets active bottomnav element to the one that was just clicked 
   * @param {Event} event the event that triggered this function call
   * @param {String} newValue the value of the new active element
   */
  const handleChange = (event, newValue) => {
    event.preventDefault();

    setValue(newValue);
    
    if (offBaseDashboard()) {
      RouteManager.redirectWithHash("/dashboard", newValue);
    } else {
      RouteManager.setHash(newValue);
    }
  };

  function offBaseDashboard() {
    return window.location.toString().includes("bookmarks") || window.location.toString().includes("group") || window.location.toString().includes("transaction");
  }

  /**
   * Display the shortcut menu on mousedown 
   * @param {Event} event mouseEvent that triggered this function
   */
  function handleEvent(event) {
    if (event.type === "mousedown") {
      if (enableShortcut) { 
        setShortcutActive(true);
      }
      setBookmarksDeployed(false);
    } else if (event.type === "mouseup") {
      setShortcutActive(false);
      RouteManager.redirectWithHash("/dashboard", "new-transaction");
    }
  }

  // Only display if there's a user logged in
  if (SessionManager.userFullySignedIn()) {
    return (
      <AppBar position="fixed" color="primary" sx={{ top: 'auto', bottom: 0 }} data-testid="bottomnav">
        <BottomNavigation sx={{ widthi: '100%' }} value={value} onChange={handleChange}>
          <BottomNavigationAction
            label="People"
            value="people"
            icon={<PersonIcon fontSize="large" sx={{ color: "#F2DF56" }}/>}
          />
          <BottomNavigationAction
            label="New Transaction"
            value="new-transaction"
            onMouseDown={(e) => handleEvent(e)}
            onMouseUp={(e) => handleEvent(e)}
            icon={<AddBoxIcon fontSize="large" sx={{ color: "#B0C856" }}/>}
          />
          <BottomNavigationAction
            label="Groups"
            value="groups"
            icon={<GroupsIcon fontSize="large" sx={{ color: "#FDB90F" }}/>}
          />
        </BottomNavigation>
      </AppBar>
    )
  }
}

