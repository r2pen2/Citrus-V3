// Library Imports
import { useState, useEffect } from "react";
import { Button, CardActionArea, CardContent, Typography, FormControl, InputLabel, Select, MenuItem } from "@mui/material";

// API Imports
import { UserRelation } from "../../api/db/objectManagers/userManager";
import { SessionManager } from "../../api/sessionManager";

// Component Imports
import { SectionTitle } from "./Labels";
import { AvatarIcon } from "./Avatars";
import { OutlinedCard } from "./Surfaces";

export function SortSelector({setSortingScheme, sortingScheme}) {
    return (
        <FormControl className="sort-select-box w-100">
            <InputLabel id="sort-select-label">Sort By:</InputLabel>
            <Select 
                value={sortingScheme} 
                labelId="sort-select-label" 
                onChange={(e) => setSortingScheme(e.target.value)} 
                label="Sort By:"
                className="w-25"
            >
                <MenuItem value={UserRelation.sortingSchemes.BALANCE}>Balance</MenuItem>
                <MenuItem value={UserRelation.sortingSchemes.ABSOLUTEVALUE}>Balance (Absolute Value)</MenuItem>
                <MenuItem value={UserRelation.sortingSchemes.LASTINTERACTED}>Last Interacted</MenuItem>
                <MenuItem value={UserRelation.sortingSchemes.NUMTRANSACTIONS}>Total Transactions</MenuItem>
                <MenuItem value={UserRelation.sortingSchemes.DISPLAYNAME}>Alphabetically</MenuItem>
            </Select>
        </FormControl>
    )
}

export function PeopleList({relations, sortingScheme}) {

    function renderRelationCards(relevantRelations) {
        const sortedRelations = UserRelation.applySort(sortingScheme, relevantRelations);
        return sortedRelations.map((relation, index) => {
            return <UserRelationCard key={index} relation={relation} />;
        })
    }

    return (
        <div>
            <SectionTitle title="Friends">
                <Button variant="contained">Add Friends</Button>
            </SectionTitle>
            { renderRelationCards(relations.friends) }
            <SectionTitle title="Other Users" />
            { renderRelationCards(relations.others) }
        </div>
    )
}

export function UserRelationCard({relation}) {

    function getBalanceColor() {
        if (relation.balance > 0) {
            return "primary";
        }
        if (relation.balance < 0) {
            return "error";
        }
        return "";
    }

    return (
        <section className="user-relation-card w-100">
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
                            <div className="w-10">
                              <Typography variant="h1" color={getBalanceColor()}>${Math.abs(relation.balance)}</Typography>
                            </div>
                         </div>
                  </CardContent>
              </CardActionArea>
          </OutlinedCard>
        </section>
    )
} 