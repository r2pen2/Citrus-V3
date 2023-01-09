// Style imports
import "./style/users.scss";

// Library imports
import { Button, Tooltip } from '@mui/material';
import { useState, useEffect} from 'react';
import { OutlinedCard } from "./Surfaces";
import GroupsIcon from '@mui/icons-material/Groups';
import HandshakeIcon from '@mui/icons-material/Handshake';

// Component imports
import { AvatarIcon } from "./Avatars";
import { EmojiBalanceBar, BalanceLabel } from "./Balances";

// API imports
import { UserRelation } from "../../api/db/objectManagers/userManager";
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
  }, [userId]);

  function renderHistory() {
    return userRelation.getHistory().map((history, index) => {

      function renderIcon() {
        return (
          <Tooltip placement="left" title={history.group ? "This was a group transaction" : "This was a transaction between friends"} >
            { history.group ? <GroupsIcon /> : <HandshakeIcon /> }
          </Tooltip>
        )
      }

      function handleClick(e) {
        RouteManager.redirectToTransaction(history.transaction);
      }
      
      return (
        <OutlinedCard onClick={handleClick} hoverHighlight={true} key={index}>
          <div className="w-100 px-3 mt-3 mb-3 d-flex flex-row align-items-center justify-content-between history-card">
            <div className="d-flex flex-column align-items-left">
              <div className="d-flex flex-row align-items-center gap-10">
                { renderIcon() }
                <h2>
                  { history.transactionTitle }
                </h2>
              </div>
              <p>{getDateString(history.date)}</p>
            </div>
            <BalanceLabel history={history} />
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
        <BalanceLabel userRelation={userRelation} size="large" />
        <EmojiBalanceBar userRelation={userRelation} size="large"/>
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