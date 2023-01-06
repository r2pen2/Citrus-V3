import "./style/balances.scss";
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { CurrencyManager } from "../../api/currencyManager"; 

export function EmojiBalanceBar({relation, size}) {

    function renderEmojis() {

        // First we sort balances
        const sortedBalances = Object.keys(relation.balances).sort().reduce(
            (obj, key) => {
                obj[key] = relation.balances[key];
                return obj;
            },
            {}
        )
        // This sorting is really fucked lmao it's not actually sorting by emoji name but instead sorting by the stringified unicode representation (I think)
        // So ☕ is handled as U+2615 and 🍕 is U+1F355

        return Object.entries(sortedBalances).map((key, idx) => {

            const amt = Math.abs(key[1]);

            function getTooltip() {
                if (key[1] > 0) {
                    return `You're owed ${amt} ${key[0]}`;
                }
                if (key[1] < 0) {
                    return `You owe ${amt} ${key[0]}`;
                }
            }

            if (key[0] !== "USD" && key[1] !== 0) {
                return (
                    <Tooltip key={idx} title={getTooltip()}>
                        <Badge badgeContent={amt} color={key[1] > 0 ? "citrusGreen" : "citrusRed"}>
                            <div className={"emoji-badge " + size}>
                                {key[0]}
                            </div>
                        </Badge>
                    </Tooltip>
                )
            }
        })    
    }
    
    return (
        <div className="d-flex flex-row w-100 overflow-auto align-items-center gap-10 justify-content-center">
            {renderEmojis()}
        </div>
    )
}

export function HistoryBalanceLabel({history}) {

    const amt = history.getAmount();
  
    function getHistoryColor() {
        if (amt > 0) {
          return "color-primary";
        }
        if (amt < 0) {
          return "text-red";
        }
        return "";
    }

    return <h2 className={getHistoryColor()}>{history.currency.legal ? CurrencyManager.formatUSD(amt) : history.currency.type + " x " + amt}</h2>;
}

export function RelationBalanceLabel({relation, size}) {

    const legalBal = relation.balances["USD"];

    function getBalanceColor() {
        if (legalBal > 0) {
            return "primary";
        }
        if (legalBal < 0) {
            return "error";
        }
        return "";
    }

    return <Typography variant={size === "small" ? "h1" : "h2"} color={getBalanceColor()}>{CurrencyManager.formatUSD(legalBal)}</Typography>
}