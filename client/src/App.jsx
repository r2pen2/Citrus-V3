// Style Imports
import theme from "./assets/style/theme";
import "./app.scss";
import "./assets/style/notifications.css";
import "./assets/style/bootstrap.css";
import "./assets/style/layout.css";
import "./assets/style/colors.css";

// Library Imports
import { ThemeProvider } from "@mui/material";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { NotificationContainer } from 'react-notifications';
import React, { useEffect, useState } from 'react';

// Component Imports
import Login from "./components/login/Login";
import Dashboard from "./components/dashboard/Dashboard";
import Topbar from "./components/topbar/Topbar";
import HomePage from "./components/homePage/HomePage";
import InviteHandler from "./components/inviteHandler/InviteHandler";

// API imports
import { SessionManager } from "./api/sessionManager";
import { auth } from "./api/firebase";

export const UsersContext = React.createContext();
export const GroupsContext = React.createContext();
export const TransactionsContext = React.createContext();

const currentUserManager = SessionManager.getCurrentUserManager();

const skipHomePage = true;

function App() {

  // Update user when auth changes
  useEffect(() => {
    auth.onAuthStateChanged(async (authUser) => {
      if (authUser) {
        // Set session details
        SessionManager.setCurrentUser(authUser);

        // Sync user's DB doc
        const userAlreadyExists = await currentUserManager.documentExists();
        if (userAlreadyExists) {
          // User already exists on DB
        } else {
          // User doesn't already exist (somehow...)
        }
      }
      else {
        // Sign user out
        SessionManager.clearLS();
      }
    })
  }, []);

  const [usersData, setUsersData] = useState({});
  const [transactionsData, setTransactionsData] = useState({});
  const [groupsData, setGroupsData] = useState({});

  // I present to you: Citrus Financial
  return (
    <div className="app" data-testid="app-wrapper">
      <Router>
        <ThemeProvider theme={theme}>
        <UsersContext.Provider value={usersData} >
        <TransactionsContext.Provider value={transactionsData} >
        <GroupsContext.Provider value={groupsData} >
          <Topbar/>
          <Routes>
            <Route path="*" element={skipHomePage ? <Login /> : <HomePage />} />
            <Route path="/home" element={skipHomePage ? <Login /> : <HomePage />} />
            <Route path="/login/*" element={<Login/>} />
            <Route path="/dashboard/*" element={<Dashboard/>} />
            <Route path="/invite" element={<InviteHandler />} />
          </Routes>
        </GroupsContext.Provider>
        </TransactionsContext.Provider>
        </UsersContext.Provider>
        </ThemeProvider>
        <NotificationContainer />
        <div id="recaptcha-container"></div>
      </Router>
    </div>
  )
}



export default App;
