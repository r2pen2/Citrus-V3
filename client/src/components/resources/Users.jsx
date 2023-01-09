// Style imports
import "./style/users.scss";

// Library imports
import { Button, Tooltip, Dialog, TextField, Select, MenuItem } from '@mui/material';
import { useState, useEffect } from 'react';
import { OutlinedCard } from "./Surfaces";
import GroupsIcon from '@mui/icons-material/Groups';
import HandshakeIcon from '@mui/icons-material/Handshake';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

// Component imports
import { AvatarIcon } from "./Avatars";
import { EmojiBalanceBar, BalanceLabel } from "./Balances";

// API imports
import { UserRelation, UserRelationHistory } from "../../api/db/objectManagers/userManager";
import { SessionManager } from "../../api/sessionManager";
import { RouteManager } from "../../api/routeManager";
import { getDateString } from "../../api/strings";
import { CurrencyManager } from "../../api/currencyManager";
import { DBManager } from "../../api/db/dbManager";

const currentUserManager = SessionManager.getCurrentUserManager();

export function UserDetail() {
  const params = new URLSearchParams(window.location.search);
  const userId = params.get("id");

  const [userRelation, setUserRelation] = useState(new UserRelation());
  const [settleOpen, setSettleOpen] = useState(false);
  const [settleCurrency, setSettleCurrency] = useState({legal: true, legalType: CurrencyManager.legalCurrencies.USD, emojiType: CurrencyManager.emojiCurrencies.BEER});
  const [settleAmount, setSettleAmount] = useState(0);

  useEffect(() => {

    async function fetchTransactionData() {
      // Check if there's an ID
      if (!userId || userId.length <= 0) {
        RouteManager.redirect("/dashboard");
        return;
      }
      const relation = await currentUserManager.getRelationWithUser(userId);
      setUserRelation(relation);
      const usd = relation.balances["USD"] ? relation.balances["USD"] : 0;
      setSettleAmount(usd < 0 ? Math.abs(usd) : 0);
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

  function handleLegalButtonPress() {
    const newState = {legal: !settleCurrency.legal, legalType: settleCurrency.legalType, emojiType: settleCurrency.emojiType};
    setSettleCurrency(newState);
    updateCurrencyAmount(newState);
  }

  function populateCurrencyTypeSelect() {
    const menu = settleCurrency.legal ? CurrencyManager.legalCurrencies : CurrencyManager.emojiCurrencies;
    return Object.entries(menu).map((entry) => {
        return <MenuItem key={entry[0]} value={entry[1]}>{entry[1]}</MenuItem>
    })
  }

  function updateCurrencyAmount(state) {
    const curr = state.legal ? state.legalType : state.emojiType;
    const amt = userRelation.balances[curr] ? userRelation.balances[curr] : 0
    setSettleAmount(amt < 0 ? Math.abs(amt) : 0);
  }

  function handleCurrencyTypeChange(e) {
    let newState = {
      legal: null,
      legalType: null,
      emojiType: null
    }
    if (settleCurrency.legal) {
      newState.legal = e.target.value;
      newState.legalType = e.target.value;
      newState.emojiType = settleCurrency.emojiType;
    } else {
      newState.legal = settleCurrency.legal;
      newState.legalType = settleCurrency.legalType;
      newState.emojiType = e.target.value;
    }
    setSettleCurrency(newState);
    updateCurrencyAmount(newState);
  }

  function updateSettleAmount(e) {
    const newAmt = parseFloat(e.target.value);
    if (newAmt < 0) {
        return;
    }
    setSettleAmount(newAmt);
  }

  async function handleSettleSubmit() {
    const newTransactionTitle = `${SessionManager.getDisplayName()} settled with ${userRelation.displayName}`;

    let settleGroups = {};

    // Find out how much goes to each group
    const curr = settleCurrency.legal ? settleCurrency.legalType : settleCurrency.emojiType;
    const totalDebt = userRelation.balances[curr] ? (userRelation.balances[curr] < 0 ? userRelation.balances[curr] : 0) : 0; 
    let amtLeft = settleAmount < Math.abs(totalDebt) ? settleAmount : Math.abs(totalDebt);
    console.log(amtLeft);
    for (const history of userRelation.getHistory()) {
      console.log(history);
      if (amtLeft > 0) {
        const group = history.group;
        if (Math.abs(history.amount) > amtLeft) {
          // This will be the last history we look at
          if (group) {
            settleGroups[group] = settleGroups[group] ? settleGroups[group] + amtLeft : amtLeft; 
          }
          amtLeft = 0;
        } else {
          if (group) {
            settleGroups[group] = settleGroups[group] ? settleGroups[group] - history.amount : - history.amount; 
          }
          amtLeft += history.amount > 0 ? -1 * history.amount : history.amount;
        }
      }
    }

    // First, we have to create the transaction on the database so that the new transactionID can be placed into userRelationHistories
    const transactionManager = DBManager.getTransactionManager();
    transactionManager.setCreatedBy(SessionManager.getUserId());
    transactionManager.setCurrencyLegal(settleCurrency.legal);
    transactionManager.setCurrencyType(settleCurrency.legal ? settleCurrency.legalType : settleCurrency.emojiType);
    transactionManager.setAmount(settleAmount);
    transactionManager.setTitle(newTransactionTitle);
    transactionManager.updateBalance(SessionManager.getUserId(), settleAmount);
    transactionManager.updateBalance(userId, -1 * settleAmount);
    
    // Add settle Groups
    for (const k of Object.keys(settleGroups)) {
      transactionManager.updateSettleGroup(k, settleGroups[k]);
    }

    await transactionManager.push();

    // Create a relationHistory for user 1
    const h1 = new UserRelationHistory();
    h1.setAmount(settleAmount);
    h1.setCurrencyLegal(settleCurrency.legal);
    h1.setCurrencyType(settleCurrency.legal ? settleCurrency.legalType : settleCurrency.emojiType);
    h1.setTransaction(transactionManager.documentId);
    h1.setTransactionTitle(newTransactionTitle);
    
    // Create a relationHistory for user2
    const h2 = new UserRelationHistory();
    h2.setAmount(-1 * settleAmount);
    h2.setCurrencyLegal(settleCurrency.legal);
    h2.setCurrencyType(settleCurrency.legal ? settleCurrency.legalType : settleCurrency.emojiType);
    h2.setTransaction(transactionManager.documentId);
    h2.setTransactionTitle(newTransactionTitle);

    // Add this relation to both users
    const user1Manager = DBManager.getUserManager(SessionManager.getUserId());
    const user2Manager = DBManager.getUserManager(userId);
    let user1Relation = await user1Manager.getRelationWithUser(userId);
    let user2Relation = await user2Manager.getRelationWithUser(SessionManager.getUserId());
    user1Relation.addHistory(h1);
    user2Relation.addHistory(h2);
    user1Manager.updateRelation(userId, user1Relation);
    user2Manager.updateRelation(SessionManager.getUserId(), user2Relation);
    
    // Push users
    let success = true;
    const pushed1 = await user1Manager.push();
    const pushed2 = await user2Manager.push();
    success = (success && pushed1 && pushed2);

    for (const k of Object.keys(settleGroups)) {
        // If there are groups to settle in, add data to groups
        const groupManager = DBManager.getGroupManager(k);
        groupManager.addTransaction(transactionManager.documentId);
        const currencyKey = settleCurrency.legal ? settleCurrency.legalType : settleCurrency.emojiType;
        
        const fromBal = await groupManager.getUserBalance(SessionManager.getUserId());
        fromBal[currencyKey] = fromBal[currencyKey] ? fromBal[currencyKey] + settleGroups[k] : settleGroups[k];
        const toBal = await groupManager.getUserBalance(userId);
        toBal[currencyKey] = toBal[currencyKey] ? toBal[currencyKey] - settleGroups[k] : -1 * settleGroups[k];
        groupManager.updateBalance(SessionManager.getUserId(), fromBal);
        groupManager.updateBalance(userId, toBal);
        
        const pushed = await groupManager.push();
        success = (success && pushed);
    }

    if (success) {
        RouteManager.redirectToTransaction(transactionManager.documentId);
    }
    
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
        <Button className="w-100" variant="contained" onClick={() => setSettleOpen(true)}>Settle</Button>
        <Button className="w-100 text-light" variant="contained" color="venmo">Venmo</Button>
      </section>
      <section className="d-flex flex-column align-items-center m-5 gap-10 w-75">
        { renderHistory() }
      </section>

      <Dialog disableEscapeKeyDown fullWidth maxWidth="sm" open={settleOpen} keepMounted onClose={() => setSettleOpen(false)} aria-describedby="alert-dialog-slide-description">
        <div className="px-3 py-3 gap-10">
            <section className="d-flex flex-column align-items-center justify-content-center m-2">
                <h1>Settle with {userRelation.displayName}</h1>
            </section>
            <section className="d-flex flex-row align-items-center justify-content-center mt-5 gap-10">
              <Button className="w-25" variant="outlined" endIcon={<ArrowDropDownIcon />} onClick={() => handleLegalButtonPress()}>{settleCurrency.legal ? "$" : "😉"}</Button>
              <TextField autoFocus id="amount-input" type="number" label="Amount" value={settleAmount} onChange={updateSettleAmount} variant="standard"/>
              <Select className="w-25" id="currency-type-input" value={settleCurrency.legal ? settleCurrency.legalType : settleCurrency.emojiType} onChange={e => handleCurrencyTypeChange(e)} >
                { populateCurrencyTypeSelect() }
              </Select>
            </section>
            <section className="mt-5 mb-2 d-flex flex-column align-items-center justify-content-center">
                <Button variant="contained" disabled={settleAmount === 0} onClick={handleSettleSubmit}>Submit</Button>
            </section>
        </div>
        </Dialog>

    </div>
  );
}