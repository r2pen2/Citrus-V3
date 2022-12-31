import "./style/balances.scss";
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';

export function EmojiBalanceBar({balances, size}) {

    function renderEmojis() {

        return Object.entries(balances).map((key, idx) => {

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
                    <Tooltip title={getTooltip()}>
                        <Badge key={idx} badgeContent={amt} color={key[1] > 0 ? "citrusGreen" : "citrusRed"}>
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
        <div className="d-flex flex-row w-100 overflow-auto align-items-center justify-content-center">
            {renderEmojis()}
        </div>
    )
}