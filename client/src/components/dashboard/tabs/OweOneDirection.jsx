// Library Imports
import { useState, useEffect } from 'react';

// Component Imports
import { Breadcrumbs } from "../../resources/Navigation";
import { OweOneDirectionHeader, OweOneDirectionPerson } from "../../resources/OweCards";

// API Imports
import { SessionManager } from "../../../api/sessionManager";

// Get user manager from LS
const currentUserManager = SessionManager.getCurrentUserManager();

export default function OweOneDirection({positive}) {

  const [userRelations, setUserRelations] = useState({
    relevantRelations: [],
  });

  useEffect(() => {

    async function fetchOweData() {
      await currentUserManager.fetchData();
      const relationsFromDB = await currentUserManager.getSortedRelations();
      setUserRelations({
        relevantRelations: positive ? relationsFromDB.positive : relationsFromDB.negative,
      });
      setTimeout(() => {
        fetchOweData();
      }, 1000);
    }

    fetchOweData();
  }, [])

  function renderCards() {
    // Render the cards
    return userRelations.relevantRelations.map((relation, index) => {
      return (
        <OweOneDirectionPerson key={index} relation={relation} positive={positive}/>
      )
    })
  }

  return (
    <div className="owe-one-direction-page">
      <Breadcrumbs path={"Dashboard/IOU/" + (positive ? "Owe Me" : "I Owe")} />
      <OweOneDirectionHeader positive={positive} relations={userRelations.relevantRelations} />
      <div className="owe-one-direction-container">
        { renderCards() }
      </div>
  </div>
  )
}