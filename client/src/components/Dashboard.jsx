// Library Imports
import { useState } from 'react'

// Component Imports
import { BottomNav, Topbar, dashboardPages, DashboardPeople, DashboardGroups, DashboardAdd } from "./resources/DashboardResources";

export default function Dashboard() {

  const [dashboardPage, setDashboardPage] = useState(dashboardPages.PEOPLE);

  function getDashboardPage() {
    if (dashboardPage === dashboardPages.PEOPLE) {
      return <DashboardPeople />;
    }
    if (dashboardPage === dashboardPages.GROUPS) {
      return <DashboardGroups />;
    }
    if (dashboardPage === dashboardPages.ADD) {
      return <DashboardAdd />;
    }
  }

  return (
    <div className="d-flex flex-column align-items-center justify-content-between h-100">
      <Topbar />
      { getDashboardPage() }
      <BottomNav dashboardPage={dashboardPage} setDashboardPage={setDashboardPage}/>
    </div>
  )
}
