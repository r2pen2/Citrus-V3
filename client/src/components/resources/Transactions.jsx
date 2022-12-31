// Style imports
import "./style/transactions.scss";

// Library imports
import { CircularProgress, Typography, MenuItem, InputLabel, Select, CardContent, CardActionArea, Tooltip, Button, IconButton, FormControl, TextField } from '@mui/material';
import { useState, useEffect} from 'react';
import { OutlinedCard } from "./Surfaces";
import CampaignIcon from '@mui/icons-material/Campaign';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import SendIcon from '@mui/icons-material/Send';

// Component imports
import { AvatarStack, AvatarIcon, AvatarCard } from "./Avatars";
import { SectionTitle } from "./Labels";
import { Breadcrumbs } from "./Navigation";

// API imports
import { getDateString, cutAtSpace, showDollars } from "../../api/strings";
import { sortByDataCreatedAt } from "../../api/sorting";
import { DBManager } from "../../api/db/dbManager";
import { SessionManager } from "../../api/sessionManager";
import { RouteManager } from "../../api/routeManager";
import { CurrencyManager } from "../../api/currencyManager";

const currentUserManager = SessionManager.getCurrentUserManager()

export function TransactionList(props) {

  const bracketNames = ["Today", "Yesterday", "This Week", "This Month", "This Year", "Older"];
  const [listState, setListState] = useState({
    numFetched: -1,
    brackets: [[], [], [], [], [], []]
  })
  
  // Fetch transactions on mount
  useEffect(() => {
    async function fetchUserTransactions() {
        // Get all transaction IDs that user is in
        await currentUserManager.fetchData();
        let transactionIds = await currentUserManager.getTransactions();
        let newTransactionManagers = [];
        for (const transactionId of transactionIds) {
            const transactionManager = DBManager.getTransactionManager(transactionId);
            await transactionManager.fetchData();
            newTransactionManagers.push(transactionManager);
        }
        newTransactionManagers = sortByDataCreatedAt(newTransactionManagers);
        if (props.numDisplayed) { // Throw out extra transactions if we're limiting the number we're displaying
            newTransactionManagers = newTransactionManagers.slice(0, props.numDisplayed);
        }
        // Sort transactionManagers into brackets
        const day = 86400000;
        let newBrackets = [[], [], [], [], [], []];
        for (const transactionManager of newTransactionManagers) {
          const ageInDays = (new Date().getTime() - new Date(transactionManager.createdAt).getTime() / day);
          if (ageInDays <= 1) {
            newBrackets[0].push(transactionManager);
          } else if (ageInDays <= 2) {
            newBrackets[1].push(transactionManager);
          } else if (ageInDays <= 7) {
            newBrackets[2].push(transactionManager);
          } else if (ageInDays <= 30) {
            newBrackets[3].push(transactionManager);
          } else if (ageInDays <= 365) {
            newBrackets[4].push(transactionManager);
          } else {
            newBrackets[5].push(transactionManager);
          }
        }
        // Set state
        setListState({
          numFetched: newTransactionManagers.length,
          brackets: newBrackets
        })
        setTimeout(() => {
          fetchUserTransactions()
        }, 1000);
    }

    fetchUserTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

   /**
  * Renders cards for each of the user's transactions
  * @param {Array} a array of user's transactions
  */
  function renderTransactions() {

    if (listState.numFetched === -1) { // If we don't yet have a list of transactions, just display a little loading circle
      return (
        <div className="d-flex flex-row justify-content-center">
          <CircularProgress />
        </div>
      )
    }
  
    if (listState.numFetched === 0) { // If there are no transactions on a user, display a message to indicate
      return    (     
        <div className="d-flex flex-row mh-100 align-items-center justify-content-center">
          <Typography>
            User has no transactions.
          </Typography>
        </div>
        )
    }

    // for each time bracket, render a bracket label and all of the transactions in it
    return listState.brackets.map((bracket, bracketIdx) => { 
      return (
        <div key={bracketNames[bracketIdx]} className="d-flex flex-column gap-10">
          { (bracket.length > 0 && !props.numDisplayed) ? <SectionTitle title={bracketNames[bracketIdx]} line="hidden"/> : ""}
          { bracket.map((transactionManager, idx) => {
            return (
              <div key={idx} data-testid={"transaction-card-" + transactionManager.getDocumentId()}>
                <TransactionCard transactionManager={transactionManager} />
              </div>
            )
          }) }
        </div>
      )
    })
  }
    
  return (
    <div>
      { renderTransactions() }
    </div>
  );
}

/**
 * Render a transaction card from current user's perspective
 * @param {string} transactionManager TransactionManager for this transaction 
 */
export function TransactionCard({transactionManager}) {
    
    const [context, setContext] = useState({
      title: "",
      initialBalance: 0,
      currentBalance: 0,
      allUsers: [],
      settledUsers: [],
      createdAt: null,
      dateString: "",
    });
    const [settleState, setSettleState] = useState({
      menuOpen: false,
      amount: 0,
      userSelected: null,
      userPicklistContent: [],
      maxSettleAmount: 0
    });
    const settleInputId = "settle-amount-input-" + transactionManager.getDocumentId();


    useEffect(() => {
      /**
      * Get transaction context from user's perspective
      */
       async function getTransactionContext() {
        const title = await transactionManager.getTitle();
        const transactionUser = await transactionManager.getUser(SessionManager.getUserId());
        const createdAt = await transactionManager.getCreatedAt();
        let allUsers = [];
        let settledUsers = [];
        // Go through tranasctions and pick out all users that aren't current user
        // Also populate "settled" array
        const newPicklistContent = [];
        const transactionUsers = await transactionManager.getUsers();
        for (const transactionUser of transactionUsers) {
          let userDisplayName = null;
          if (transactionUser.id !== SessionManager.getUserId()) {
            const userManager = DBManager.getUserManager(transactionUser.id);
            userDisplayName = await userManager.getDisplayName();
            newPicklistContent.push({id: transactionUser.id, displayName: userDisplayName });
            allUsers.push(transactionUser.id);
          }
          if (transactionUser.getSettled()) {
            settledUsers.push(transactionUser.id);
          }
        }
        allUsers.unshift(SessionManager.getUserId());
        setContext({
          title: title,
          initialBalance: transactionUser.initialBalance,
          currentBalance: transactionUser.currentBalance,
          allUsers: allUsers,
          settledUsers: settledUsers,
          createdAt: createdAt,
          dateString: getDateString(createdAt ? createdAt.toDate() : new Date())
        });
        setSettleState({
          menuOpen: settleState.menuOpen,
          amount: 0,
          userSelected: settleState.userSelected,
          userPicklistContent: newPicklistContent,
          maxSettleAmount: 0
        });
      }

      getTransactionContext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function getFraction() {

      function getFractionColor() {
        if (context.currentBalance > 0) {
          return "primary";
        }
        if (context.currentBalance < 0) {        
          return "error"; // Not actually an error— error color
        }
        return "";
      }

      function getDenominatorColor() {
        if (context.initialBalance > 0) {
          return "primary";
        }
        if (context.initialBalance < 0) {
          return "error"
        }
        return "";
      }

      function getFractionTooltip() {
        const amtString = showDollars(Math.abs(context.currentBalance));
        if (context.currentBalance > 0 ) {
          return `You are still owed ${amtString}`;
        } 
        if (context.currentBalance < 0) {
          return `You still owe ${amtString}`;
        }
        return "You're settled!";
      }

      return (
        <Tooltip title={getFractionTooltip()} placement="right">
          <div>
            <Typography align="right" variant="h5" component="div" color={getFractionColor()}>{showDollars(Math.abs(context.currentBalance))}</Typography>
            <Typography align="right" variant="subtitle2" component="div" color={getDenominatorColor()}>/ {showDollars(Math.abs(context.initialBalance))}</Typography>
          </div>
        </Tooltip>
      )
    }

    function handleAmountChange(e) {
      const newAmount = parseInt(e.target.value);
      if (newAmount <= settleState.maxSettleAmount) {
        setSettleState({
          menuOpen: settleState.menuOpen,
          amount: newAmount,
          userSelected: settleState.userSelected,
          userPicklistContent: settleState.userPicklistContent,
          maxSettleAmount: settleState.maxSettleAmount
        })
      }
    }

    function toggleSettleMenu() {
      setSettleState({
        menuOpen: !settleState.menuOpen,
        amount: settleState.amount,
        userSelected: settleState.userSelected,
        userPicklistContent: settleState.userPicklistContent,
        maxSettleAmount: settleState.maxSettleAmount
      })
    }

    async function handleSettleSend() {
      const amt = document.getElementById(settleInputId).value;
      // If the initialBalance is positive, this user owes money. The one sending the settlement should be the one who owes money.
      const fromUser = context.initialBalance > 0 ? currentUserManager : DBManager.getUserManager(settleState.userSelected);
      const toUser = context.initialBalance > 0 ? settleState.userSelected : SessionManager.getUserId();
      await fromUser.settleWithUserInTransaction(toUser, transactionManager.getDocumentId(), parseInt(amt));
      window.location.reload();
    }

    async function handleUserChange(e) {
      let newAmount = 0;
      let newSelected = "";
      if (e.target.value !== "") {
        // This is a user, so we need to dig up some information
        newSelected = e.target.value;
        // Go into this transaction and find how much we owe this user
        const relation = await transactionManager.getRelationForUsers(newSelected, SessionManager.getUserId());
        newAmount = relation.amount;
      }
      setSettleState({
        menuOpen: settleState.menuOpen,
        amount: newAmount,
        userSelected: newSelected,
        userPicklistContent: settleState.userPicklistContent,
        maxSettleAmount: newAmount
      });
    }

    function populateUserSelect() {
      if (settleState.userPicklistContent) {
        return settleState.userPicklistContent.map((user, index) => {
            return (
                <MenuItem key={index} value={user.id}>{user.displayName}</MenuItem>
            )
        });
      }
    }
    return (
      <div className={"transaction-card d-flex flex-row align-items-center justify-content-center " + (context.currentBalance !== 0 ? "unpaid" : "")}>
        <section className="transaction-actions d-flex flex-column align-items-center justify-content-center">
          <Tooltip title="Settle" placement="left">
            <IconButton onClick={() => toggleSettleMenu()}>
              <LocalAtmIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Remind" placement="left">
            <IconButton>
              <CampaignIcon />
            </IconButton>
          </Tooltip>
        </section>
        <section className={"settle-actions d-flex flex-row align-items-center justify-content-between gap-10 " + (!settleState.menuOpen ? "hidden" : "")}>
          <FormControl>
            <InputLabel id="user-select-label">User</InputLabel>
            <Select 
              style={{minWidth: 150}}
              labelId="user-select-label" 
              value={settleState.userSelected} 
              onChange={handleUserChange} 
              label="User"
            >
                <MenuItem value=""><em>None</em></MenuItem>
                { populateUserSelect() }
            </Select>
          </FormControl>
        </section>
        <section className={"settle-actions d-flex flex-row align-items-center justify-content-between gap-10 " + (!settleState.userSelected ? "hidden" : "")}>
          <FormControl>
            <TextField
              value={settleState.amount}
              onChange={(e) => handleAmountChange(e)}
              inputProps={{min: 0, style: { textAlign: 'center' }}}
              label="Settle Value"
              type="number"
              id={settleInputId}
            >
            </TextField>
          </FormControl>
          <Tooltip title="Send">
            <IconButton onClick={() => handleSettleSend()}>
              <SendIcon />
            </IconButton>
          </Tooltip>
        </section>
        <section className="transaction-card-content-wrapper w-100">
          <OutlinedCard key={transactionManager.getDocumentId()} disableMarginBottom={true}>
              <CardActionArea onClick={() => window.location = "/dashboard/transactions?id=" + transactionManager.getDocumentId()}>
                  <CardContent className={context.currentBalance === 0 ? "bg-green" : ""}>
                      <div className="transaction-card-content d-flex flex-row align-items-center w-100">
                          <div className="side">
                            <AvatarStack ids={context.allUsers} checked={context.settledUsers}/>
                          </div>
                          <div className="center d-flex flex-row overflow-hidden justify-content-center">
                              <div className="d-flex flex-column align-items-center">
                                  <Typography variant="h1">{context.title}</Typography>
                                  <Typography variant="subtitle1" sx={{ color: "gray "}}>{context.dateString}</Typography>
                              </div>
                          </div>
                          <div className="side">
                            { getFraction() }
                          </div>
                      </div>
                  </CardContent>
              </CardActionArea>
          </OutlinedCard>
        </section>
      </div>
    )
}

export function TransactionDetail() {
  const params = new URLSearchParams(window.location.search);
  const transactionId = params.get("id");

  const [transactionData, setTransactionData] = useState({
    currency: {legal: true, type: "USD"},
    amount: null,
    date: null,
    title: "",
    balances: {},
    createdBy: null,
    group: null,
  });

  function getCurrencyString(balance) {
    return transactionData.currency.legal ? CurrencyManager.formatUSD(Math.abs(balance)) : transactionData.currency.type + " x " + Math.abs(balance);
  }

  useEffect(() => {

    async function fetchTransactionData() {
      // Check if there's an ID
      if (!transactionId || transactionId.length <= 0) {
        RouteManager.redirect("/dashboard");
        return;
      }
      const tm = DBManager.getTransactionManager(transactionId);
      const data = await tm.fetchData();
      setTransactionData(data);
    }

    // Fetch transaction data on load
    fetchTransactionData();
  }, [transactionId])

  async function handleDelete() {
    const transactionManager = DBManager.getTransactionManager(transactionId);
    await transactionManager.cleanDelete();
    RouteManager.redirect("/dashboard");
  }

  function getUserIds() {
    let userIds = [];
    for (const key of Object.entries(transactionData.balances)) {
      userIds.push(key[0]);
    }
    return userIds;
  }  

  function getAmountTextColor(uid) {
    const selfBalance = transactionData.balances[uid];
    if (selfBalance > 0) {
      return "color-primary";
    }
    if (selfBalance < 0) {
      return "text-red";
    }
    return "";
  }

  function renderPaidByCards() {
    // eslint-disable-next-line array-callback-return
    return Object.entries(transactionData.balances).map((key, index) => {
      const uid = key[0];
      const bal = key[1];
      if (bal > 0) {
        return (
          <AvatarCard key={uid} id={uid}>
            <div className="color-primary font-weight-bold">{getCurrencyString(bal)}</div>
          </AvatarCard>
        )
      }
    })
  }

  function renderLendorCards() {
    // eslint-disable-next-line array-callback-return
    return Object.entries(transactionData.balances).map((key, index) => {
      const uid = key[0];
      const bal = key[1];
      if (bal < 0) {
        return (
          <AvatarCard key={uid} id={uid}>
            <div className={"text-red font-weight-bold"}>{getCurrencyString(bal)}</div>
          </AvatarCard>
        )
      }
    })
  }

  return (
    <div className="d-flex flex-column align-items-center">
      <Breadcrumbs path={`Dashboard/Transactions/${transactionData.title}`}/>
      <section className="d-flex flex-column align-items-center gap-10 m-5">
        <h2>{transactionData.title}</h2>
        <h1 className={getAmountTextColor(SessionManager.getUserId())}>{getCurrencyString(transactionData.amount)}</h1>
        <AvatarStack ids={getUserIds()}/>
      </section>
      <section className="d-flex flex-column w-50 justify-content-start">
        <h2>Paid by:</h2>
          {renderPaidByCards()}
        <h2>Lendors:</h2>
          {renderLendorCards()}
      </section>
      <Tooltip className="m-5" title="The nuclear option">      
        <Button variant="outlined" color="error" onClick={() => {handleDelete()}}>Delete this Transaction</Button>
      </Tooltip>
    </div>
  );
}


/**
 * Render a card representing a TransactionRelation
 * @param {TransactionRelation} relation TransactionRelation object to render
 */
export function TransactionRelationCard({relation}) {

  return (
      <OutlinedCard>
          <CardContent>
              <div className="d-flex flex-column align-items-center justify-content-between gap-10">
                  <div className="d-flex flex-row justify-content-center align-items-center gap-10">
                      <AvatarIcon src={relation.from.pfpUrl} alt={"From user photo"}/>
                      <Typography variant="subtitle1" color="primary">${relation.initialAmount}</Typography>
                      <Typography variant="subtitle1" color="primary">⟹</Typography>
                      <AvatarIcon src={relation.to.pfpUrl} alt={"To user photo"}/>
                  </div>
                  <Typography>{cutAtSpace(relation.from.displayName)} owes {cutAtSpace(relation.to.displayName)} ${relation.initialAmount}</Typography>
              </div>
          </CardContent>
      </OutlinedCard>
  )
} 

export function TransactionRelationList({relations}) {
  function mapRelations() {
    return relations.map((relation, index) => {
      return <TransactionRelationCard relation={relation} key={index} />;
    })
  } 
  return (
    <div className="m-5 w-100">
      {mapRelations()}
    </div>
  );
}