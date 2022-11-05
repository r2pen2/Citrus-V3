// Style Imports
import "./assets/style/App.css";
import "./assets/style/bootstrap.css";

// Library Imports
import { useState, useEffect } from "react";

// Component Imports
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";


const pages = {
  PEOPLE: "people",
  NEW: "new",
  GROUPS: "groups",
}

const loggedIn = true;

function App() {

  const [userData, setUserData] = useState({
    displayName: "",
    pfpUrl: "",
  })

  const [currentPage, setCurrentPage] = useState(pages.PEOPLE);

  return (
    <div className="app">
      { loggedIn ? <Dashboard /> : <Login /> }
    </div>
  )
}

export default App;
