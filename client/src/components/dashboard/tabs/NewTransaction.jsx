// Library imports;
import { Paper, Tabs, Tab } from "@mui/material";
import { useState } from 'react';

// Component Imports
import Split from "./newTransaction/Split";
import IOU from "./newTransaction/IOU";

// API imports
import { Debugger } from "../../../api/debugger";

export default function NewTransaction() {
  const [tabValue, setTabValue] = useState(0);

  // eslint-disable-next-line no-unused-vars
  function sendTransactionToDatabase() {
    Debugger.log("Sending transaction to database!")
  }

  function handleChangeTab(e, newValue) {
    setTabValue(newValue);
  }

  function renderTab() {
    if (tabValue === 0) {
      return (
        <Split />
      )
    }
    if (tabValue === 1) {
      return (
        <IOU/>
      )
    } else {
      return <div>Error: Invalid tab ID</div>
    }
  }
  
  return (
    <div className="new-transaction-wrapper">
      <Paper className="new-transaction-content" elevation={12} sx={{ backgroundColor: '#fafafa', borderRadius: "10px"}}>
        <div className="tab-container">
          <Tabs variant="fullWidth" className="tabs" value={tabValue} onChange={handleChangeTab} aria-label="new transaction tabs">
            <Tab className="tab-item left" label="Split" />
            <Tab className="tab-item" label="IOU"/>
          </Tabs>
        </div>  
        <div className="tab-content w-100 d-flex flex-column align-items-center justify-content-start">
          { renderTab() }
        </div>
      </Paper>
    </div>
  );
}
