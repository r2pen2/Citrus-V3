// Style Imports
import "./style/people.scss";

// Library Imports
import { useState, useEffect } from "react";
import { Button, CardActionArea, CardContent, Typography, FormControl, InputLabel, Select, MenuItem, CircularProgress, ToggleButton } from "@mui/material";

// API Imports
import { UserRelation } from "../../api/db/objectManagers/userManager";

// Component Imports
import { SectionTitle } from "./Labels";
import { AvatarIcon } from "./Avatars";
import { OutlinedCard } from "./Surfaces";
import { EmojiBalanceBar, RelationBalanceLabel } from "./Balances";

export function PeopleList({relations, sortingScheme, filter}) {

    function renderRelationCards(relevantRelations, doLoad) {
        if (!relations.fetched) {
            return doLoad ? <section className="d-flex flex-row justify-content-center w-100 align-items-center"><CircularProgress/></section> : <div></div>
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
                    { renderRelationCards(relations.others, true) }
            </section>
        }
        
        function renderFriends() {
            return <section>
                <SectionTitle title="Friends">
                    <Button variant="contained">Add Friends</Button>
                </SectionTitle>
                { renderRelationCards(relations.friends, true) }   
            </section>
        }

        return (
            <div className="relation-cards-wrapper">
                { filter.friends ? renderFriends() : <div></div>}
                { filter.others ? renderOthers() : <div></div>}
            </div>
        )
    }

    return renderPeopleList()
}

export function UserRelationCard({relation}) {

    return (
        <div className="user-relation-card w-100 mb-3">
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
                            <div className="w-10 d-flex flex-column gap-10 overflow-auto">
                                <RelationBalanceLabel relation={relation} size="small" />
                                <EmojiBalanceBar relation={relation} size="small" />
                            </div>
                         </div>
                  </CardContent>
              </CardActionArea>
          </OutlinedCard>
        </div>
    )
} 