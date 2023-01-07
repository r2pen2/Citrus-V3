// Style imports
import "./style/transactions.scss";

// Library imports
import { Tooltip, Button } from '@mui/material';
import { useState, useEffect} from 'react';

// Component imports
import { AvatarStack, AvatarCard } from "./Avatars";
import { Breadcrumbs } from "./Navigation";

// API imports
import { DBManager } from "../../api/db/dbManager";
import { SessionManager } from "../../api/sessionManager";
import { RouteManager } from "../../api/routeManager";
import { CurrencyManager } from "../../api/currencyManager";

const currentUserManager = SessionManager.getCurrentUserManager();

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
