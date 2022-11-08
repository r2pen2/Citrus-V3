import { Breadcrumbs } from "../../resources/Navigation";
import { TransactionList } from "../../resources/Transactions"

export default function AllTransactions() {

  return (
    <div className="all-transactions-wrapper">
      <Breadcrumbs path="Dashboard/Transactions" />
      <TransactionList showBrackets={true}/>
    </div>
  );
}
