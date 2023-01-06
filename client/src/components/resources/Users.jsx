// Style imports
import "./style/users.scss";

// Library imports
import { Button } from '@mui/material';
import { useState, useEffect} from 'react';
import { OutlinedCard } from "./Surfaces";

// Component imports
import { AvatarIcon } from "./Avatars";
import { EmojiBalanceBar, HistoryBalanceLabel, RelationBalanceLabel } from "./Balances";

// API imports
import { UserRelation } from "../../api/db/objectManagers/userManager";
import { DBManager } from "../../api/db/dbManager";
import { SessionManager } from "../../api/sessionManager";
import { RouteManager } from "../../api/routeManager";
import { getDateString } from "../../api/strings";

const currentUserManager = SessionManager.getCurrentUserManager();

export function UserDetail() {
  const params = new URLSearchParams(window.location.search);
  const userId = params.get("id");

  const [userRelation, setUserRelation] = useState(new UserRelation());

  useEffect(() => {

    async function fetchTransactionData() {
      // Check if there's an ID
      if (!userId || userId.length <= 0) {
        RouteManager.redirect("/dashboard");
        return;
      }
      const relation = await currentUserManager.getRelationWithUser(userId);
      setUserRelation(relation);
    }

    // Fetch transaction data on load
    fetchTransactionData();
  }, [userId])

  function getBalanceColor() {
    if (userRelation.balances["USD"] > 0) {
      return "color-primary";
    }
    if (userRelation.balances["USD"] < 0) {
      return "text-red";
    }
    return "";
  }

  function renderHistory() {
    return userRelation.getHistory().map((history, index) => {
      
      return (
        <OutlinedCard hoverHighlight={true} key={index} onClick={() => RouteManager.redirectToTransaction(history.transaction)}>
          <div className="w-100 m-3 d-flex flex-row align-items-center justify-content-between history-card">
            <div className="d-flex flex-column align-items-left">
              <h2>{history.transactionTitle}</h2>
              <p>{getDateString(history.date)}</p>
            </div>
            <div className="w-20 d-flex flex-column">
              <HistoryBalanceLabel history={history} />
            </div>
          </div>
        </OutlinedCard>
      )
    })
  }

  return (
    <div className="d-flex flex-column align-items-center">
      <section className="d-flex flex-column align-items-center m-5 gap-10">
        <AvatarIcon id={userId} size="150px"/>
        <h1>{userRelation.displayName}</h1>
        <RelationBalanceLabel relation={userRelation} size="large" />
        <EmojiBalanceBar relation={userRelation} size="large"/>
      </section>
      <section className="d-flex flex-row justify-content-between w-50 gap-10">
        <Button className="w-100" variant="contained">Settle</Button>
        <Button className="w-100 text-light" variant="contained" color="venmo">Venmo</Button>
      </section>
      <section className="d-flex flex-column align-items-center m-5 gap-10 w-75">
        {renderHistory()}
      </section>
    </div>
  );
}