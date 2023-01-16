// Style Imports
import "./style/people.scss";

// Library Imports
import { Typography, CircularProgress, Button, CardActionArea, CardContent, FormControl, InputLabel, Select, MenuItem, Chip } from "@mui/material";

// API Imports
import { UserRelation } from "../../api/db/objectManagers/userManager";

// Component Imports
import { SectionTitle } from "./Labels";
import { AvatarIcon } from "./Avatars";
import { OutlinedCard } from "./Surfaces";
import { EmojiBalanceBar, BalanceLabel } from "./Balances";

export function PeopleList({relations, sortingScheme, filter}) {

    function renderRelationCards(relevantRelations) {
        if (!relations.fetched) {
            return <section className="d-flex flex-row justify-content-center w-100 align-items-center"><CircularProgress/></section>;
        }
        const sortedRelations = UserRelation.applySort(sortingScheme, relevantRelations);
        return sortedRelations.map((relation, index) => {
            return <UserRelationCard key={index} relation={relation} />;
        })
    }

    function renderPeopleList() {

        function renderOthers() {
            return <section>
                    <SectionTitle title="Other Users" />
                    { renderRelationCards(relations.others) }
            </section>
        }
        
        function renderFriends() {
            return <section>
                <SectionTitle title="Friends">
                    <Button variant="contained">Add Friends</Button>
                </SectionTitle>
                { renderRelationCards(relations.friends) }   
            </section>
        }

        return (
            <div className="relation-cards-wrapper">
                { filter.friends ? renderFriends() : <div></div>}
                { filter.others ? renderOthers() : <div></div>}
            </div>
        )
    }

    return renderPeopleList();
}


export function UserRelationCard({relation}) {

    function emojisShouldRender() {
        const userBalances = Object.keys(relation.balances);
        // Check if user has more than one currency
        const multipleCurrencies = userBalances.length > 1;
        // Check if user's currencies include USD
        const hasUSD = userBalances.includes("USD");
        // Check if USD is the only currency
        const justUSD = userBalances.length === 1 && hasUSD;
        return multipleCurrencies && !justUSD;
      }
    
    return (
        <div className="w-100 mb-3">
            <OutlinedCard disableMarginBottom={true}>
                <CardActionArea onClick={() => window.location = "/dashboard/user?id=" + relation.userId}>
                    <CardContent>
                        <div className="transaction-card-content d-flex flex-row align-items-center w-100">
                            <div className="w-10">
                                <AvatarIcon id={relation.userId} size={60}/>
                            </div>
                            <div className="w-100 d-flex flex-row overflow-hidden justify-content-start">
                                <Typography variant="h1" marginLeft={"20px"}>{relation.displayName}</Typography>
                            </div>
                            <div className="w-10 d-flex flex-column gap-10 align-items-center mr-2">
                                <BalanceLabel userRelation={relation} size="small" />
                                { emojisShouldRender() && <EmojiBalanceBar userRelation={relation} size="small" /> }
                            </div>
                        </div>
                    </CardContent>
                </CardActionArea>
            </OutlinedCard>
        </div>
    )
} 

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