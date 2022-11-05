// Library Imports
import { useState } from "react";

// Component Imports
import Logo from "../../assets/images/LogoBlack.png"

export const dashboardPages=  {
    PEOPLE: "people",
    GROUPS: "groups",
    NEW: "new"
}

export function BottomNav({dashboardPage, setDashboardPage}) {

    function getPageActive(tabPage) {
        if (tabPage === dashboardPage) {
            return " active";
        } 
        return "";
    }

    return (
        <nav>
            <ul className="nav nav-pills">
                <li className="nav-item">
                  <button className={"nav-link" + getPageActive(dashboardPages.PEOPLE)} onClick={() => setDashboardPage(dashboardPages.PEOPLE)}>People</button>
                </li>
                <li className="nav-item">
                  <button className={"nav-link" + getPageActive(dashboardPages.ADD)} onClick={() => setDashboardPage(dashboardPages.ADD)}>+</button>
                </li>
                <li className="nav-item">
                  <button className={"nav-link" + getPageActive(dashboardPages.GROUPS)} onClick={() => setDashboardPage(dashboardPages.GROUPS)}>Groups</button>
                </li>
            </ul>
        </nav>
    )
}

export function Topbar() {
    return (
        <nav>
            <img src={Logo} alt="citrus-logo" />
        </nav>
    )
}

export function DashboardGroups() {
    return (
        <div>Groups Page</div>
    )
}

export function DashboardAdd() {
    return (
        <div>Add Page</div>
    )
}

export function DashboardPeople() {
    return (
        <div>People Page</div>
    )
}