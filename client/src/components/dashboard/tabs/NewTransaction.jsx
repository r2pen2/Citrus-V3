// Library imports
import { useState, useEffect, forwardRef } from 'react';
import { Button, Select, Dialog, ToggleButton, ToggleButtonGroup, DialogContentText, Slide, MenuItem, FormGroup, TextField, FormControlLabel, DialogActions, TableContainer, TableHead, Table, TableRow, TableCell, TableBody, Tooltip, Checkbox, IconButton, CardActionArea, Avatar } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CancelIcon from '@mui/icons-material/Cancel';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import GroupsIcon from '@mui/icons-material/Groups';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

// Component imports
import { TransactionRelationList } from "../../resources/Transactions";
import { OutlinedCard } from "../../resources/Surfaces";
import { SectionTitle } from "../../resources/Labels";

// API imports
import { SessionManager } from "../../../api/sessionManager";
import { CurrencyManager } from "../../../api/currencyManager";
import { RouteManager } from "../../../api/routeManager";
import { DBManager } from "../../../api/db/dbManager";
import { AvatarIcon, AvatarToggle } from '../../resources/Avatars';
import { sortByDisplayName, placeCurrentUserFirst } from '../../../api/sorting';
import { TransactionRelation, TransactionManager, TransactionUser } from "../../../api/db/objectManagers/transactionManager";
import { makeNumeric } from '../../../api/strings';
import { Debugger } from '../../../api/debugger';

// Get user mananger from LS (which we know exists becuase we made it to this page)
const currentUserManager = SessionManager.getCurrentUserManager();

/**
 * Wrapper component for new transaction
 * @param {Props} props Currently unused
 */
export default function NewTransaction(props) {

    const [newTransactionState, setNewTransactionState] = useState({ // Information contained within new transaction
        users: [],
        group: null,
        currency: "USD",
        total: null,
        title: ""
    });
    const [newTransactionPage, setNewTransactionPage] = useState("users"); // Which page of new transaction are we on

    function renderPage() {
        switch (newTransactionPage) {
            case "users":
                return <UsersPage newTransactionState={newTransactionState} setNewTransactionState={setNewTransactionState} nextPage={() => setNewTransactionPage("amount")}/>;
            case "amount":
                return <AmountPage newTransactionState={newTransactionState} setNewTransactionState={setNewTransactionState} nextPage={() => setNewTransactionPage("summary")}/>;
            case "summary":
                return <div>Summary</div>
            default:
                return <div>Error: invalid transaction page!</div>
        }
    }

    return (
        <div className="d-flex flex-column align-items-center justify-content-start w-100">
            <h1>{newTransactionState.group ? "New Group Expense" : "New Expense"}</h1>
            { renderPage() }
        </div>
    )
}

function UsersPage({newTransactionState, setNewTransactionState, nextPage}) {
    
    const [userData, setUserData] = useState({
        recents: [],
        groups: [],
        friends: []
    });
    const [checkedFriends, setCheckedFriends] = useState([]);
    const [checkedGroup, setCheckedGroup] = useState(null);
    const [submitEnable, setSubmitEnable] = useState(false);

    useEffect(() => {
        async function fetchUserData() {
            let friendIds = await currentUserManager.getFriends();
            let groupIds = await currentUserManager.getGroups();
            let newFriends = [];
            for (const friendId of friendIds) {
                const friendUserManager = DBManager.getUserManager(friendId);
                let friendName = await friendUserManager.getDisplayName();
                let friendPhoto = await friendUserManager.getPfpUrl();
                newFriends.push({id: friendId, displayName: friendName, pfpUrl: friendPhoto, checked: false});
            }
            let newGroups = [];
            for (const groupId of groupIds) {
                const groupUserManager = DBManager.getGroupManager(groupId);
                let groupName = await groupUserManager.getName();
                let groupMemberCount = await groupUserManager.getMemberCount();
                let groupMembers = await groupUserManager.getUsers();
                newGroups.push({id: groupId, name: groupName, memberCount: groupMemberCount, members: groupMembers});
            }
            setUserData({
                recents: userData.recents,
                groups: newGroups,
                friends: newFriends,
            })
        }

        fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUserManager])

    function renderRecents() {
        return <div></div>
    }

    function handleGroupCheckbox(e, id) {
        e.preventDefault();
        if (checkedGroup === id) {
            setCheckedGroup(null);
            setSubmitEnable(checkedFriends.length > 0);
        } else {
            setCheckedGroup(id);
            setSubmitEnable(true);
        }
    }

    function renderGroups() {
        return userData.groups.map(group => {
            return (
                <OutlinedCard key={"group-" + group.id} backgroundColor={(!checkedGroup || checkedGroup === group.id) ? "white" : "lightgray"}>
                    <CardActionArea onClick={e => handleGroupCheckbox(e, group.id)}>
                        <div className="d-flex flex-row justify-content-between">
                            <div className="d-flex flex-row align-items-center gap-10">
                                <div className="d-flex flex-row align-items-center gap-10">
                                    <GroupsIcon />
                                    <div>x{group.memberCount}</div>
                                </div>
                                <div>{group.name}</div>
                            </div>
                            <Checkbox disabled={(checkedGroup !== null && checkedGroup !== group.id)} checked={checkedGroup === group.id} icon={<RadioButtonUncheckedIcon />} checkedIcon={<CancelIcon />} />
                        </div>
                    </CardActionArea>
                </OutlinedCard>
            )
        })
    }

    function handleFriendCheckbox(e, id) {
        e.preventDefault();
        if (checkedGroup) {
            return;
        }
        let newCheckedFriends = checkedFriends;
        if (newCheckedFriends.indexOf(id) !== -1) {
            newCheckedFriends = newCheckedFriends.filter(f => f.id === id);
            setCheckedFriends(newCheckedFriends);
        } else {
            newCheckedFriends.push(id); 
            setCheckedFriends(newCheckedFriends);
        }
        setSubmitEnable(newCheckedFriends.length > 0 || checkedGroup);
    }
    
    function renderFriends() {
        return userData.friends.map(friend => {
            return (
                <OutlinedCard key={"friend-" + friend.id} backgroundColor={(!checkedGroup) ? "white" : "lightgray"}>
                    <CardActionArea onClick={e => handleFriendCheckbox(e, friend.id)} >
                        <div className="d-flex flex-row justify-content-between">
                            <div className="d-flex flex-row align-items-center gap-10">
                                <AvatarIcon displayName={friend.displayName} src={friend.pfpUrl}/>
                                <div>{friend.displayName}</div>
                            </div>
                            <Checkbox disabled={checkedGroup !== null} checked={checkedFriends.includes(friend.id) && !checkedGroup} icon={<AddCircleOutlineIcon />} checkedIcon={<AddCircleIcon />} />
                        </div>
                    </CardActionArea>
                </OutlinedCard>
            )
        })
    }

    async function submitAdd() {
        let newUsersList = [];
        if (checkedGroup) {
            // checkedGroup is just an ID, so we have to dig up the group's data
            for (const groupData of userData.groups) {
                if (groupData.id === checkedGroup) {
                    // Get user info
                    for (const groupMemberId of groupData.members) {
                        const groupMemberUserManager = DBManager.getUserManager(groupMemberId);
                        let displayName = await groupMemberUserManager.getDisplayName();
                        let pfpUrl = await groupMemberUserManager.getPfpUrl();
                        newUsersList.push({id: groupMemberId, displayName: displayName, pfpUrl: pfpUrl, paidByManualAmount: null, splitManuamAmount: null});
                    }
                }
            }
        } else {
            for (const friendId of checkedFriends) {
                // CheckedFriends is just a list of IDs, so we have to dig up the friend's full data
                for (const friendData of userData.friends) {
                    if (friendData.id === friendId) {            
                        newUsersList.push({id: friendData.id, displayName: friendData.displayName, pfpUrl: friendData.pfpUrl, paidByManualAmount: null, splitManuamAmount: null});
                    }
                }
            }
            newUsersList.push({id: SessionManager.getUserId(), displayName: SessionManager.getDisplayName(), pfpUrl: SessionManager.getPfpUrl(), paidByManualAmount: null, splitManuamAmount: null}); // Add self
        }
        setNewTransactionState({
            users: newUsersList,
            group: checkedGroup ? checkedGroup : null,
            currency: newTransactionState.currency,
            total: newTransactionState.total,
            title: newTransactionState.title
        });
        nextPage();
    }

    return (
        <div className="d-flex flex-column w-100 align-items-center gap-10">
            <div className="vh-60 w-100">
                <SectionTitle title="Recent"/>
                { renderRecents() }
                <SectionTitle title="Groups"/>
                { renderGroups() }
                <SectionTitle title="Friends"/>
                { renderFriends() }
            </div>
            <Button variant="contained" color="primary" className="w-50" disabled={!submitEnable} onClick={() => submitAdd()}>Next</Button>
        </div>

    )
}

function AmountPage({newTransactionState, setNewTransactionState, nextPage}) {

    const [submitEnable, setSubmitEnable] = useState(false);
    const [currencyState, setCurrencyState] = useState({
        legal: true,
        legalType: CurrencyManager.legalCurrencies.USD,
        emojiType: CurrencyManager.emojiCurrencies.BEER,
    })
    const [isIOU, setIsIOU] = useState(false);
    const [paidByDialogOpen, setPaidByDialogOpen] = useState(false);
    const [paidByTab, setPaidByTab] = useState("even");
    const [paidByCheckedUsers, setPaidByCheckedUsers] = useState([SessionManager.getUserId()]);
    const [paidByCheckedUsersPrevious, setPaidByCheckedUsersPrevious] = useState([SessionManager.getUserId()]);
    const [newTransactionStatePrevious, setNewTransactionStatePrevious] = useState(newTransactionState);

    function submitAmount() {
        nextPage();
    }

    function populateCurrencyTypeSelect() {
        const menu = currencyState.legal ? CurrencyManager.legalCurrencies : CurrencyManager.emojiCurrencies;
        return Object.entries(menu).map((entry) => {
            return <MenuItem key={entry[0]} value={entry[1]}>{entry[1]}</MenuItem>
        })
    }

//setCurrencyState({legal: e.target.value, type: currencyState.type, placeholderText: currencyState.placeholderText

    function handleCurrencyTypeChange(e) {
        if (currencyState.legal) {
            setCurrencyState({
                legal: e.target.value, 
                legalType: e.target.value, 
                emojiType: currencyState.emojiType
            });
        } else {
            setCurrencyState({
                legal: currencyState.legal, 
                legalType: currencyState.legalType, 
                emojiType: e.target.value
            });
        }
    }

    function getTextfieldPlaceholder() {
        return currencyState.legal ? "0.00" : "x1";
    }

    function getPaidByButtonText() {
        if (paidByCheckedUsers.length > 1) {
            return `${paidByCheckedUsers.length} people`;
        }
        return paidByCheckedUsers[0] === SessionManager.getUserId() ? "you" : "someone else";
    }

    function getSplitButtonText() {
        return "evenly";
    }

    function updateAmount(e) {
        const newAmt = parseFloat(e.target.value);
        if (newAmt < 0) {
            return;
        }
        setNewTransactionState({
            users: newTransactionState.users,
            group: newTransactionState.group,
            currency: newTransactionState.currency,
            total: newAmt,
            title: newTransactionState.title
        });
    }

    function getTotalManualAmounts() {
        let total = 0;
        for (const user of newTransactionState.users) {
            if (user.paidByManualAmount) {
                total += user.paidByManualAmount;
            }
        }
        return total;
    }

    function formatTotalManualAmount() {
        const typeString = currencyState.legal ? CurrencyManager.getLegalCurrencySymbol(currencyState.legalType) : currencyState.emojiType + " x ";
        return `${typeString}${getTotalManualAmounts()}`;
    }

    function handlePaidByDialogClose(event, reason) {
        if (reason === "backdropClick") {
            return;
        }

        console.log(paidByCheckedUsers)

        setPaidByDialogOpen(false);
    }

    function getTotalString() {
        const typeString = currencyState.legal ? CurrencyManager.getLegalCurrencySymbol(currencyState.legalType) : currencyState.emojiType + " x ";
        return `${typeString}${newTransactionState.total}`;
    }

    function togglePaidByCheckedUser(userId) {
        if (paidByCheckedUsers.includes(userId)) {
            // Remove this user
            setPaidByCheckedUsers(paidByCheckedUsers.filter(uid => uid !== userId));
        } else {
            // This is kinda ugly but need to make a new array bc of pointers!
            let newCheckedUsers = [];
            for (const uid of paidByCheckedUsers) {
                newCheckedUsers.push(uid);
            }
            newCheckedUsers.push(userId);
            setPaidByCheckedUsers(newCheckedUsers);
        }
    }

    function renderPaidByTab() {

        function updateUserPaidByManualAmount(e, uid) {
            const amt = parseInt(e.target.value);
            if (amt < 0) {
                return;
            }
            let newUsers = [];
            for (const user of newTransactionState.users) {
                if (user.id === uid) {
                    user.paidByManualAmount = amt;
                }
                newUsers.push(user);
            }

            if (amt >= 0) {
                let newCheckedUsers = [];
                for (const id of paidByCheckedUsers) {
                    newCheckedUsers.push(id);
                }
                if (!newCheckedUsers.includes(uid)) {
                    newCheckedUsers.push(uid);
                }
                setPaidByCheckedUsers(newCheckedUsers);
            }

            if (amt === 0) {
                let newCheckedUsers = paidByCheckedUsers.filter(id => id !== uid);
                setPaidByCheckedUsers(newCheckedUsers);
            }

            setNewTransactionState({
                users: newUsers,
                group: newTransactionState.group,
                currency: newTransactionState.currency,
                total: newTransactionState.total,
                title: newTransactionState.title
            });
        }

        function renderEvenUser(user, index) {
            return (
                <div key={index} className="m-2 d-flex flex-row w-80 align-items-center justify-content-between">
                    <section className="d-flex flex-row justify-content-start gap-10 align-items-center w-80">
                        <AvatarIcon src={user.pfpUrl} displayName={user.displayName} />
                        <div className="d-flex flex-column">
                            <div>{user.displayName}</div>
                            { user.id === SessionManager.getUserId() ? <div className="color-primary">(You)</div> : <div/>}
                        </div>
                    </section>
                    <section className="d-flex flex-row justify-content-end align-items-center">
                        <Checkbox checked={paidByCheckedUsers.includes(user.id)} onChange={() => togglePaidByCheckedUser(user.id)}></Checkbox>
                    </section>
                </div>
            )
        }

        function renderManualUser(user, index) {
            return (
                <div key={index} className="m-2 d-flex flex-row w-80 align-items-center justify-content-between">
                    <section className="d-flex flex-row justify-content-start gap-10 align-items-center w-80">
                        <AvatarIcon src={user.pfpUrl} displayName={user.displayName} />
                        <div className="d-flex flex-column">
                            <div>{user.displayName}</div>
                            { user.id === SessionManager.getUserId() ? <div className="color-primary">(You)</div> : <div/>}
                        </div>
                    </section>
                    <section className="d-flex flex-row justify-content-end align-items-center">
                        <TextField id="amount-input" type="number" label="Amount" value={user.paidByManualAmount ? user.paidByManualAmount : "\0"} placeholder={getTextfieldPlaceholder()} onChange={(e) => updateUserPaidByManualAmount(e, user.id)} variant="standard" className="w-50"/>
                    </section>
                </div>
            )
        }

        function getTotalWarning() {
            if (getTotalManualAmounts() < newTransactionState.total) {
                return "Too low ✘"
            }
            if (getTotalManualAmounts() > newTransactionState.total) {
                return "Too high ✘";
            }
            return "Good ✓";
        }

        // First sort alphabetically
        let sortedUsers = sortByDisplayName(newTransactionState.users);
        // Then place current user first
        sortedUsers = placeCurrentUserFirst(sortedUsers);
        if (paidByTab === "even") {
            return sortedUsers.map((user, index) => {
                return renderEvenUser(user, index);
            })
        }
        if (paidByTab === "manual") {
            return sortedUsers.map((user, index) => {
                if (index < sortedUsers.length - 1) {
                    return renderManualUser(user, index);
                } else {
                    return (
                        <div key={index} className="d-flex flex-column w-100 align-items-center">
                            { renderManualUser(user, index) }
                            <div className="d-flex flex-row justify-content-end w-80">
                                <div className="d-flex flex-column align-items-end">
                                    <p className={"font-weight-bold " + (getTotalManualAmounts() !== newTransactionState.total ? "text-red" : "color-primary")}>Total: { formatTotalManualAmount() }</p>
                                    <p className={getTotalManualAmounts() !== newTransactionState.total ? "text-red" : "color-primary"}>{ getTotalWarning() }</p>
                                </div>
                            </div>
                        </div>
                    )
                }
            })
        }
        return <div>Invalid paidByTab</div>;
    }

    function updateTitle(e) {
        setNewTransactionState({
            users: newTransactionState.users,
            group: newTransactionState.group,
            currency: newTransactionState.currency,
            total: newTransactionState.total,
            title: e.target.value
        });
    }

    return (
        <div className="d-flex flex-column w-100 align-items-center gap-10">
            <div className="d-flex flex-column vh-60 w-100 align-items-center justify-content-center gap-10">
                <h2>{newTransactionState.title ? '"' + newTransactionState.title + '"' : "\0"}</h2>
                <TextField id="name-input" label="Enter Name" variant="standard" onChange={updateTitle}/>
                <section className="d-flex flex-row justify-space-between gap-10">
                    <Select id="currency-family-input" value={currencyState.legal} onChange={e => setCurrencyState({legal: e.target.value, legalType: currencyState.legalType, emojiType: currencyState.emojiType})} >
                        <MenuItem value={true}>$</MenuItem>
                        <MenuItem value={false}>😉</MenuItem>
                    </Select>
                    <TextField id="amount-input" type="number" label="Amount" value={newTransactionState.total ? newTransactionState.total : "\0"} placeholder={getTextfieldPlaceholder()} onChange={updateAmount} variant="standard"/>
                    <Select id="currency-type-input" value={currencyState.legal ? currencyState.legalType : currencyState.emojiType} onChange={e => handleCurrencyTypeChange(e)} >
                        { populateCurrencyTypeSelect() }
                    </Select>
                </section>
                <section className="d-flex flex-column align-items-center gap-10">
                    <div className="d-flex flex-row gap-10 align-items-center">
                        <div className={(!newTransactionState.total) ? "light-text" : ""}>Paid by:</div>
                        <Button disabled={!newTransactionState.total} variant="contained" endIcon={<ArrowDropDownIcon />} onClick={() => setPaidByDialogOpen(true)}>{getPaidByButtonText()}</Button>
                    </div>
                    <div className="d-flex flex-row gap-10 align-items-center">
                        <div className={(isIOU || !newTransactionState.total) ? "light-text" : ""}>Split:</div>
                        <Button disabled={isIOU || !newTransactionState.total} variant="contained" endIcon={<ArrowDropDownIcon />}>{getSplitButtonText()}</Button>
                    </div>
                </section>
                <div>
                    OR
                </div>
                <section>
                    <FormGroup>
                        <FormControlLabel control={<Checkbox checked={isIOU} onChange={() => setIsIOU(!isIOU)}/>} label="This is an IOU" />
                    </FormGroup>
                </section>
            </div>

            <Button variant="contained" color="primary" className="w-50" disabled={!submitEnable} onClick={() => submitAmount()}>Next</Button>
            
            
            <Dialog disableEscapeKeyDown fullWidth maxWidth="sm" open={paidByDialogOpen} keepMounted onClose={(e, r) => handlePaidByDialogClose(e, r)} aria-describedby="alert-dialog-slide-description">
                <div className="px-3 py-3 gap-10">
                    <section className="d-flex flex-column align-items-center justify-content-center m-2">
                        <h1>{getTotalString()}</h1>
                        <h2>Paid By:</h2>
                    </section>
                    <section className="d-flex flex-column align-items-center justify-content-center m-2">
                        <ToggleButtonGroup color="primary" value={paidByTab} exclusive onChange={e => {setPaidByTab(e.target.value)}}>
                            <ToggleButton value="even">Even</ToggleButton>
                            <ToggleButton value="manual">Manual</ToggleButton>
                        </ToggleButtonGroup>
                    </section>
                    <section className="d-flex flex-column align-items-center justify-content-start vh-50 overflow-auto">
                        { renderPaidByTab() }
                    </section>
                    <section className="d-flex flex-column align-items-center justify-content-center">
                        <Button variant="contained" onClick={(e, r) => handlePaidByDialogClose(e, r)} disabled={(paidByTab === "even" && paidByCheckedUsers.length < 1) || (paidByTab === "manual" && getTotalManualAmounts() !== newTransactionState.total)}>Next</Button>
                    </section>
                </div>
            </Dialog>
        </div>

    )
}