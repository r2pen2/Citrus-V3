import { FormControl, InputLabel, Select, MenuItem, ToggleButton, Chip } from "@mui/material";
import { UserRelation } from "../../api/db/objectManagers/userManager";

export function SortSelector({setSortingScheme, sortingScheme, setFilter, filter}) {

    /**
     * Render a working filter chip with colors and labels 
     * @param {Boolean} bool whether or not filter is on 
     * @param {String} label filter title 
     * @returns Chip element styled to current state
     */
    function renderFilterChip(bool, label) {

        /**
         * Change state based on filter label
         */
        function handleFilterChange() {
            if (label === "friends") {
                setFilter({
                    friends: !filter.friends,
                    others: filter.others
                })
            }
            if (label === "others") {
                setFilter({
                    friends: filter.friends,
                    others: !filter.others
                })
            }
        }

        // Format label string to show user
        const forwardLabel = label.toLowerCase()[0].toUpperCase() + label.toLowerCase().substring(1);
        return bool ? <Chip label={forwardLabel} color="primary" onClick={handleFilterChange} /> : <Chip label={forwardLabel} onClick={handleFilterChange} />;
    }

    return (
        <div className="d-flex flex-row justify-content-between">
            <FormControl className="sort-select-box w-100">
                <InputLabel id="sort-select-label">Sort By:</InputLabel>
                <Select 
                    value={sortingScheme} 
                    labelId="sort-select-label" 
                    onChange={(e) => setSortingScheme(e.target.value)} 
                    label="Sort By:"
                    className="w-50"
                >
                    <MenuItem value={UserRelation.sortingSchemes.BALANCE}>Balance</MenuItem>
                    <MenuItem value={UserRelation.sortingSchemes.ABSOLUTEVALUE}>Balance (Absolute Value)</MenuItem>
                    <MenuItem value={UserRelation.sortingSchemes.LASTINTERACTED}>Last Interacted</MenuItem>
                    <MenuItem value={UserRelation.sortingSchemes.NUMTRANSACTIONS}>Total Transactions</MenuItem>
                    <MenuItem value={UserRelation.sortingSchemes.DISPLAYNAME}>Alphabetically</MenuItem>
                </Select>
            </FormControl>
            <div className="d-flex flex-row gap-10 align-items-center justify-content-end w-50">
                { setFilter && filter && renderFilterChip(filter.friends, "friends") }
                { setFilter && filter && renderFilterChip(filter.others, "others") }
            </div>
        </div>
        
    )
}