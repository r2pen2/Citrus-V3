// Library imports
import { useState, useEffect } from 'react';
import { Button, Select, CardContent, InputLabel, FormControl, InputAdornment, Input, MenuItem, Typography, TextField, CircularProgress, Paper, TableContainer, TableHead, Table, TableRow, TableCell, TableBody } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';

// Component imports
import { OutlinedCard } from "../../../resources/Surfaces";
import { TransactionRelationList } from "../../../resources/Transactions";

// API imports
import { SessionManager } from "../../../../api/sessionManager";
import { RouteManager } from "../../../../api/routeManager";
import { DBManager } from "../../../../api/db/dbManager";
import { AvatarIcon, AvatarToggle } from '../../../resources/Avatars';
import { sortByDisplayName } from '../../../../api/sorting';
import { TransactionRelation, TransactionUser } from "../../../../api/db/objectManagers/transactionManager";
import { makeNumeric } from '../../../../api/strings';
import { Debugger } from '../../../../api/debugger';

// Get user mananger from LS (which we know exists becuase we made it to this page)
const currentUserManager = SessionManager.getCurrentUserManager();

/**
 * Wrapper component for split new transaction
 * @param {Props} props Currently unused
 */
export default function Split(props) {

    // Keep track of which page we're on
    const [splitPage, setSplitPage] = useState(props.splitPage ? props.splitPage : "add-people");

    const [groupPicklistContent, setGroupPicklistContent] = useState(null); // Map of groups in the picklist
    const [currentGroup, setCurrentGroup] = useState("");                   // Currently selected group (by id)
    // eslint-disable-next-line no-unused-vars
    const [peopleInvolved, setPeopleInvolved] = useState([]);               // Currently selected users (by id)
    const [transactionTitle, setTransactionTitle] = useState(null);         // Title of this transaction
    const [weightedUsers, setWeightedUsers] = useState(new Map());          // Map for keeping track of user roles and amounts

    useEffect(() => {
        async function fetchUserData() {
            // Get user manager
            currentUserManager.fetchData();
            const groups = await currentUserManager.getGroups();
            console.log(groups);
            // Also get the names of each group
            var groupObjects = [];
            for (const groupId of groups) {
                const groupManager = DBManager.getGroupManager(groupId);
                const groupName = await groupManager.getName();
                groupObjects.push({id: groupId, name: groupName})
            }
            setGroupPicklistContent(groupObjects);
        }

        fetchUserData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    function renderSplitPage() {
        switch (splitPage) {
            case "add-people":
                return <AddPeoplePage weightedUsers={weightedUsers} setWeightedUsers={setWeightedUsers} setSplitPage={setSplitPage} currentGroup={currentGroup} setCurrentGroup={setCurrentGroup} groupPicklistContent={groupPicklistContent} setPeopleInvolved={setPeopleInvolved}/>;
            case "transaction-details":
                return <TransactionDetailsPage transactionTitle={transactionTitle}currentGroup={currentGroup} setSplitPage={setSplitPage} groupPicklistContent={groupPicklistContent} setTransactionTitle={setTransactionTitle} peopleInvolved={peopleInvolved}/>;
            case "amount-table":
                return <AmountTable weightedUsers={weightedUsers} setWeightedUsers={setWeightedUsers} transactionTitle={transactionTitle} setSplitPage={setSplitPage} peopleInvolved={peopleInvolved}/>;
            case "transaction-summary":
                return <TransactionSummaryPage currentGroup={currentGroup} weightedUsers={weightedUsers} transactionTitle={transactionTitle} setSplitPage={setSplitPage} peopleInvolved={peopleInvolved}/>;
            default:
                return <div>Error: invalid split page!</div>
        }
    }

    return (
        <div className="d-flex flex-column align-items-center justify-content-start w-100 h-100">
            { renderSplitPage() }
        </div>
    )
}

function AddPeoplePage({weightedUsers, setWeightedUsers, setSplitPage, groupPicklistContent, currentGroup, setCurrentGroup, setPeopleInvolved}) {
    
    const [searchString, setSearchString] = useState("");                           // Contents of search box
    const [friends, setFriends] = useState(null);                                   // List of user's friends (stored as objects)
    const [friendsLoaded, setFriendsLoaded] = useState(false);                      // Whether or not friends have loaded personal information yet
    const [searchExpanded, setSearchExpanded] = useState(false);                    // Whether or not search is expanded
    const [nextEnabled, setNextEnabled] = useState(false);                          // Whether or not the "next" button is enabled
    const [someoneIsSelected, setSomeoneIsSelected] = useState(false);              // Whether or not anyone is currently selected
    const [groupsExpanded, setGroupsExpanded] = useState(false);                    // Whether or not the groups section is expanded
    const [currentGroupUsers, setCurrentGroupUsers] = useState(null);               // All users in currently selected group
    const [currentGroupLoaded, setCurrentGroupLoaded] = useState(false);            // Whether or not data for users in current group is loaded
    const [someoneIsSelectedInGroup, setSomeoneIsSelectedInGroup] = useState(true); // Flag if a group has nobody selected in it

    /**
     * @param {Array} friendsList a list of objects representing all of the current user's friends without detailed information on them
     * Get detailed information on each friend in the list.
     * This is done after populating the list with template information in fetchFriends
     */
    async function fetchFriendDetails(friendsList) {
        for (var i = 0; i < friendsList.length; i++) {
            const currentFriend = friendsList[i];
            const friendManager = DBManager.getUserManager(currentFriend.id)
            let displayName = await friendManager.getDisplayName();
            currentFriend.displayName = displayName;
            let url = await friendManager.getPfpUrl();
            currentFriend.pfpUrl = url;
            friendsList[i] = currentFriend;
        }
        setFriends(sortByDisplayName(friendsList));
        setFriendsLoaded(true);
    }

    // Fetch user's friends on component mount
    useEffect(() => {
        /**
         * Get a list of user's friends and store their ID's, along with template information
         */
        async function fetchFriends() {
            // Get user manager
            const friendsFromDB = await currentUserManager.getFriends();
            var userFriends = [];
            for (const friendId of friendsFromDB) {
                userFriends.push({id: friendId, displayName: "", pfpUrl: null, selected: false})
            }
            const sortedFriends = sortByDisplayName(userFriends);
            setFriends(sortedFriends);
            fetchFriendDetails(userFriends);
        }
        fetchFriends();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    /**
     * Populate group select box with the names of each group the user belongs to
     * @returns {Component} menu items for each group
     */
    function populateGroupSelect() {
        if (groupPicklistContent) {
            return groupPicklistContent.map((group, index) => {
                return (
                    <MenuItem key={index} value={group.id}>{group.name}</MenuItem>
                )
            });
        }
    }

    /**
     * Change current group to value of select box
     * @param {Event} e select event
     */
    function handleGroupChange(e) {
        setCurrentGroup(e.target.value);
    }

    /**
     * Set search string to value of search box
     * @param {Event} e keypress event
     */
    function handleSearchChange(e) {
        setSearchString(e.target.value);
    }

    /**
     * Toggle the selected state of a friend by userId
     * @param {String} id id of friend to toggle selected state for
     */
    function toggleSelectedFriend(id) {
        var toggled = [];
        var foundSelectedFriend = false;
        for (const f of friends) {
            const toggledFriend = {
                id: f.id,
                displayName: f.displayName,
                pfpUrl: f.pfpUrl,
                selected: (id === f.id) ? !f.selected : f.selected 
            }
            if (toggledFriend.selected) {
                foundSelectedFriend = true;
            }
            toggled.push(toggledFriend);
        }
        setSomeoneIsSelected(foundSelectedFriend);
        setFriends(toggled);
    }

        /**
     * Toggle the selected state of a user by userId
     * @param {String} id id of user to toggle selected state for
     */
        function toggleSelectedGroupUser(id) {
            var toggled = [];
            var foundSelectedUser = false;
            for (const u of currentGroupUsers) {
                const toggledUser = {
                    id: u.id,
                    displayName: u.displayName,
                    pfpUrl: u.pfpUrl,
                    selected: (id === u.id) ? !u.selected : u.selected 
                }
                if (toggledUser.selected) {
                    foundSelectedUser = true;
                }
                toggled.push(toggledUser);
            }
            setSomeoneIsSelectedInGroup(foundSelectedUser);
            setCurrentGroupUsers(toggled);
        }

    /** 
    * Check if the next button should be enabled
    */
    function checkNextEnabled() {
        setNextEnabled(someoneIsSelected || (currentGroup && someoneIsSelectedInGroup));
    }

    /**
     * Clear search bar
     */
    function clearSearch() {
        setSearchString("");
    }

    /**
     * Populate the friend search results with clickable avatar icons and display names
     * @returns {Component} populated friend search results
     */
    function populateFriendScroller() {
        if (!friends) {
            return;
        }
        if (!friendsLoaded) {
            return (
                <div className="friend-container">
                    <CircularProgress/>
                </div>
            );
        }
        if (searchExpanded) { // Friends exist and search is expanded
            const searchIncludedFriends = friends.filter(f => f.displayName.toLowerCase().includes(searchString.toLowerCase()));
            return searchIncludedFriends.map((friend, index) => {
                return (                            
                    <div 
                        className="friend-container" 
                        key={index} 
                        onClick={() => { 
                            toggleSelectedFriend(friend.id);
                            clearSearch();
                        }
                    }>
                        <AvatarToggle 
                            outlined={friend.selected} 
                            id={friend.id} 
                            src={friend.pfpUrl}
                            displayName={friend.displayName}
                        />
                    </div> 
                );
            });
        } 
        // Friends exist but the list is not expanded
        return friends.slice(0, 5).map((friend, index) => {
            return (
                <div 
                   className="friend-container" 
                   key={index} 
                   onClick={() => {
                    toggleSelectedFriend(friend.id);
                   }}
                >
                    <AvatarToggle 
                       outlined={friend.selected} 
                       id={friend.id} 
                       src={friend.pfpUrl}
                       displayName={friend.displayName}
                   />
                </div>
            )
        });
    }

    /**
     * Sort array of people involved by displayname and insert self at front
     * @param {array} array array of all other people (unsorted and without self)
     * @returns array of all people involved, sorted by displayname, with self in front
     */
    function sortPeopleAndAddSelf(array) {
        // Object representing current user
        const myself = {
            id: SessionManager.getUserId(),
            pfpUrl: SessionManager.getPfpUrl(),
            displayName: SessionManager.getDisplayName(),
            self: true,
        }
        array = sortByDisplayName(array); // Sort the array
        array.unshift(myself); // Put self at the start
        return array;
    }

    /** 
     * Handle next button press, passing on information to next page
     */
    function handleNext() {
        var contextSet = false;
        if (searchExpanded) {
            var friendsSelected = [];
            for (const friend of friends) {
                if (friend.selected) {
                    friendsSelected.push({
                        id: friend.id,
                        pfpUrl: friend.pfpUrl,
                        displayName: friend.displayName,
                        self: false,
                    });
                }
            }
            friendsSelected = sortPeopleAndAddSelf(friendsSelected);
            setPeopleInvolved(friendsSelected);
            for (const user of friendsSelected) {
                weightedUsers.set(user.id, {paid: 0, shouldHavePaid: 0});
            }
            setWeightedUsers(new Map(weightedUsers));
            contextSet = true;
        }
        if (groupsExpanded) {
            var usersSelected = [];
            for (const user of currentGroupUsers) {
                if (user.selected) {
                    usersSelected.push({
                        id: user.id,
                        pfpUrl: user.pfpUrl,
                        displayName: user.displayName,
                        self: false,
                    });
                }
            }
            usersSelected = sortPeopleAndAddSelf(usersSelected);
            setPeopleInvolved(usersSelected);
            for (const user of usersSelected) {
                weightedUsers.set(user.id, {paid: 0, shouldHavePaid: 0});
            }
            setWeightedUsers(new Map(weightedUsers));
            contextSet = true;
        }
        if (contextSet) {
            setSplitPage("transaction-details");
        }
    }

    /** 
     * Make sure that the search box expanded property is updated whenever 
     * the search value changes, whether or not someone is selected changes,
     * or the selected group changes.
    */
    useEffect(() => {
        setSearchExpanded(someoneIsSelected || searchString.length > 0);
        setGroupsExpanded(currentGroup ? true : false);
        checkNextEnabled();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [someoneIsSelected, someoneIsSelectedInGroup, searchString, currentGroup])

    /**
     * Fetch current group's users when it changes
     */
    useEffect(() => {
        fetchCurrentGroupUsers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentGroup])

    /**
     * Get current group's users from DB and set local array
     */
    async function fetchCurrentGroupUsers() {
        const groupManager = DBManager.getGroupManager(currentGroup);
        let users = await groupManager.getUsers();
        var usersInGroup = [];
        for (const user of users) {
            if (user !== SessionManager.getUserId()) {
                usersInGroup.push({id: user, selected: true, displayName: null, pfpUrl: null})
            }
        }
        var loadedUsers = [];
        for (const user of usersInGroup) {
            const groupUserManager = DBManager.getUserManager(user.id);
            let name = await groupUserManager.getDisplayName();
            let url = await groupUserManager.getPfpUrl();
            loadedUsers.push({id: user.id, displayName: name, selected: true, pfpUrl: url})
        }
        setCurrentGroupUsers(loadedUsers);
        setSomeoneIsSelectedInGroup(loadedUsers.length > 0);
        setCurrentGroupLoaded(true);
    }

    /**
     * Show a little list of every user in currently selected group's icon :)
     * @returns {Component} list of user icons
     */
    function populateGroupUserPreview() {

        function renderUserToggles() {
            return currentGroupUsers.map((user, index) => {
                return (
                    <div 
                        className="friend-container" 
                        key={index} 
                        onClick={() => { 
                            toggleSelectedGroupUser(user.id);
                        }
                    }>
                        <AvatarToggle 
                            outlined={user.selected} 
                            id={user.id} 
                            src={user.pfpUrl}
                            displayName={user.displayName}
                        />
                    </div> 
                )
            })
        }

        if (currentGroupLoaded && currentGroup.length > 0) {
            if (currentGroupUsers.length > 0) {
                return (
                    <div className="user-preview"> 
                        { renderUserToggles() }
                    </div>
                )
            } else {
                return (
                    <div className="d-flex flex-column justify-content-end align-items-center h-100 w-100">
                        <Typography variant="subtitle1">You're the only one in this group!</Typography>
                    </div>
                )
            }
        }
    }

    function handleGroupCancel() {
        setCurrentGroup("");
    }

    function getGroupName(groupId) {
        for (const group of groupPicklistContent) {
            if (group.id === groupId) {
                return group.name;
            }
        }
    }

    return (
        <div className="d-flex flex-column justify-content-center align-items-center padding-10 w-100 h-100">
            <div className={"search-bar " + (groupsExpanded ? "hidden" : "")}>
                <Typography variant="h6">Select Friends</Typography>
                <FormControl className="friend-search-box">
                    <Input
                        value={searchString}
                        onChange={handleSearchChange}
                        label="Friend Display Name"
                        startAdornment={
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        }
                    >
                    </Input>
                </FormControl>
            </div>
            <div className={"friend-preview " + (searchExpanded ? "expanded" : "") + (groupsExpanded ? "hidden" : "")} disabled={groupsExpanded}>
                <div className="avatar-container">
                    <div className="scroller">
                        { populateFriendScroller() }
                    </div>
                </div>
            </div>
            <div className={"group-select " + (searchExpanded ? "hidden " : "") + (groupsExpanded ? "expanded" : "")} disabled={searchExpanded}>
                <div className="divider">
                    <Typography variant="subtitle2">or</Typography>
                </div>
                <div className="title">
                    <Typography variant="h6">Assign to {currentGroup ? `"${getGroupName(currentGroup)}"` : "a Group"}</Typography>
                </div>
                <FormControl className="group-select-box">
                    <InputLabel id="group-select-label">Group</InputLabel>
                    <Select 
                        value={currentGroup} 
                        labelId="group-select-label" 
                        onChange={handleGroupChange} 
                        label="Group"
                    >
                        <MenuItem value=""><em>None</em></MenuItem>
                        { populateGroupSelect() }
                    </Select>
                </FormControl>
                { populateGroupUserPreview() }
            </div>
            <div className="next-button">
                <Button variant="contained" disabled={!nextEnabled} onClick={() => handleNext()}>Next</Button>
            </div>
            <div className={"group-cancel-button " + (groupsExpanded ? "visible" : "")}>
                <Button variant="outlined" onClick={() => handleGroupCancel()}>Cancel</Button>
            </div>
        </div>
    )
}

/**
 * 
 * @param {function} setSplitPage used for moving on to the next page of new transaction
 * @param {string} transactionTitle title of new transaction (possibly filled in from back button press) 
 * @param {function} setTransactionTitle set title of transaction to input
 * @param {string} currentGroup id of current group or null
 * @param {array<object>} groupPicklistContent all groups and some information about them (name, id, people)
 * @returns 
 */
function TransactionDetailsPage({setSplitPage, setTransactionTitle, currentGroup, groupPicklistContent, transactionTitle}) {

    const [newTitle, setNewTitle] = useState(transactionTitle ? transactionTitle : "");     // New transaction's title

    function renderHeader() {
        if (currentGroup) { 
            // Since currentGroup is just an Id, we traverse through the picklist to get the group's name
            // This is an annoying quirk of how the actual picklist element works. It's a pain in the ass 
            // but I think this is the best way to get around it at the moment.
            if (currentGroup.length > 0) {
                for (const group of groupPicklistContent) {
                    if (group.id === currentGroup) {
                        return (
                            <Typography variant="h6">{group.name}{newTitle.length > 0 ? (": " + newTitle) : ""}</Typography>
                        )
                    }
                }
            }
        } else {
            return (
                newTitle.length > 0 ? <Typography variant="h6">{newTitle}</Typography> : <Typography variant="h6">New Transaciton with Friends</Typography>
            )
        }
    }

    function checkSubmitEnable() {
        if (!newTitle) {
            return;
        }
        return newTitle.length > 0;
    }

    function handleTitleChange(e) {
        setNewTitle(e.target.value);
    }

    function setTransactionDetails() {
        let finalTitle = newTitle;
        if (currentGroup) {
            if (currentGroup.length > 0) {
                for (const group of groupPicklistContent) {
                    if (group.id === currentGroup) {
                        finalTitle = `${group.name}: ${newTitle}`;
                    }
                }
            }
        }
        setTransactionTitle(finalTitle);
    }

    return (
        <div className="transaction-detail-page d-flex flex-column justify-content-center align-items-center padding-10 w-100 h-100" onLoad={() => checkSubmitEnable()}>
            <section className="header">
                { renderHeader() }
            </section>
            <div className="transaction-detail-form">
                <div className="d-flex flex-column justify-content-center align-items-center w-100">
                    <Typography variant="subtitle1" style={{marginBottom: "10px"}}>Transaction Title:</Typography>
                    <FormControl className="title-text-field">
                        <TextField
                            value={newTitle}
                            onChange={handleTitleChange}
                            onBlur={checkSubmitEnable}
                            onFocus={checkSubmitEnable}
                            label="ex. My Transaction"
                        >
                        </TextField>
                    </FormControl>
                </div>
            </div>
            <div className="split-section">                
                <div className="w-100 d-flex flex-row align-items-center justify-content-center">
                    <Button variant="contained" disabled={!checkSubmitEnable()} className="w-25" onClick={() => {setTransactionDetails(); setSplitPage("amount-table")}}>Next</Button>
                </div>
            </div>
            <div className="hover-underline d-flex flex-row justify-content-center align-items-center p-3" onClick={() => setSplitPage("add-people")}>
                <ArrowBackIcon />
                <Typography marginLeft="5px" variant="subtitle1">Go Back</Typography>
            </div>
        </div>
    )
}

function AmountTable({weightedUsers, setWeightedUsers, transactionTitle, setSplitPage, peopleInvolved}) {

    const [totalPaid, setTotalPaid] = useState(0);
    const [totalShouldHavePaid, setTotalShouldHavePaid] = useState(0);

    function createData(displayName, amountPaid, amountShouldHavePaid, userId) {
        return { displayName, amountPaid, amountShouldHavePaid, userId };
    }

    const [tableRows, setTableRows] = useState([]);



    /**
     * Submit new map and move on to summary
     */
     function handleSubmit() {
        // Inputs will always be valid if submit button is enabled
        setSplitPage("transaction-summary");
    }

    useEffect(() => { // Make count totals on mount
        let tp = 0;
        let tshp = 0;
        for (const key of weightedUsers) {
            const user = key[1];
            tp += parseInt(user.paid);
            tshp += parseInt(user.shouldHavePaid);
        }
        setTotalPaid(tp);
        setTotalShouldHavePaid(tshp);
        
        // Create rows for table
        let newTableData = [];
        for (const key of weightedUsers) {
            const user = key[1];
            let displayName = null;
            for (const p of peopleInvolved) {
                if (p.id === key[0]) {
                    displayName = p.displayName;
                }
            }
            if (displayName) {
                newTableData.push(createData(displayName, user.paid, user.shouldHavePaid, key[0]));
            }
        }
        setTableRows(newTableData);

    }, [weightedUsers, peopleInvolved])

    function handleCellChange(event, id, changeField) {
        const inputVal = parseInt(makeNumeric(event.target.value));
        if (changeField === "paid") {
            // This is the "paid" input
            weightedUsers.set(id, {paid: inputVal, shouldHavePaid: weightedUsers.get(id).shouldHavePaid});
            setWeightedUsers(new Map(weightedUsers));

        } else if (changeField === "should-have-paid") {
            // This is the "should have paid" input
            weightedUsers.set(id, {paid: weightedUsers.get(id).paid, shouldHavePaid: inputVal});
            setWeightedUsers(new Map(weightedUsers));
        }
    }

    function getOweString(userId) {
        const amt = weightedUsers.get(userId).paid - weightedUsers.get(userId).shouldHavePaid;
        if (amt === 0) {
            return "Owes $0";
        }
        return `${amt > 0 ? "Owed " : "Owes "}$${Math.abs(amt)}`;
    }

    function getOweColor(userId) {
        const amt = weightedUsers.get(userId).paid - weightedUsers.get(userId).shouldHavePaid;
        if (amt === 0) {
            return "";
        }
        return `${amt > 0 ? "primary" : "error"}`;
    }

    function renderAvatar(userId) {
        for (const person of peopleInvolved) {
            if (person.id === userId) {
                return <AvatarIcon src={person.pfpUrl} displayName={person.displayName}></AvatarIcon>
            }
        }
    }

    function getYouString(userId) {
        if (userId === SessionManager.getUserId()) {
            return "(you)"
        }
    }
    return (
        <div className="transaction-summary-page d-flex flex-column justify-content-between">
            <section className="header">
                <Typography variant="h1">{transactionTitle}</Typography>
                <Typography variant="subtitle1">1. Select tax and tip (if applicable)</Typography>
                <Typography variant="subtitle1">2. Enter how much everyone paid and should have paid.</Typography>
            </section>
            <div className="table">
                <TableContainer component={Paper}>
                  <Table size="small" aria-label="a dense table">
                    <caption>Total $ Paid and $ Should Pay must be equal.</caption>
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell align="right">$ Paid</TableCell>
                        <TableCell align="right">$ Should Pay</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                        {tableRows.map((row) => (
                            <TableRow key={row.displayName} sx={{ '&:last-child td, &:last-child th': { border: 0 } }} >
                                <TableCell component="th" scope="row">
                                    <div className="d-flex flex-row align-items-center gap-10">
                                        {renderAvatar(row.userId)}
                                        <div className="d-flex flex-column justify-content-start">        
                                            <div className="d-flex flex-row align-items-center">
                                                <Typography variant="subtitle1" >{row.displayName}</Typography>
                                                <Typography variant="subtitle2" color="primary" style={{marginLeft: "10px"}}>
                                                    {getYouString(row.userId)}
                                                </Typography>
                                            </div>                                
                                            <Typography variant="subtitle1" color={getOweColor(row.userId)}>{getOweString(row.userId)}</Typography>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell align="right">
                                        <FormControl>
                                            <TextField
                                                value={row.amountPaid}
                                                onChange={(e) => handleCellChange(e, row.userId, "paid")}
                                                inputProps={{min: 0, style: { textAlign: 'center' }}}
                                                label="$ Paid"
                                                type="number"
                                            >
                                            </TextField>
                                        </FormControl>
                                </TableCell>
                                <TableCell align="right">
                                        <FormControl>
                                            <TextField
                                                value={row.amountShouldHavePaid}
                                                onChange={(e) => handleCellChange(e, row.userId, "should-have-paid")}
                                                inputProps={{min: 0,  style: { textAlign: 'center' }}}
                                                type="number"
                                                label="$ Should Pay"
                                            >
                                            </TextField>
                                        </FormControl>
                                </TableCell>
                            </TableRow>
                        ))}
                        <TableRow>
                            <TableCell colSpan={1} align="right">Totals</TableCell>
                            <TableCell align="right">{totalPaid}</TableCell>
                            <TableCell align="right">{totalShouldHavePaid}</TableCell>
                        </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
            </div>
            <Button variant="contained" disabled={(totalPaid !== totalShouldHavePaid || totalPaid === 0 || totalShouldHavePaid === 0)} onClick={() => {handleSubmit()}}>Submit</Button>
            <div className="hover-underline d-flex flex-row justify-content-center align-items-center p-3" onClick={() => setSplitPage("transaction-details")}>
                <ArrowBackIcon />
                <Typography marginLeft="5px" variant="subtitle1">Cancel</Typography>
            </div>
        </div>
    )
}

function TransactionSummaryPage({weightedUsers, transactionTitle, setSplitPage, peopleInvolved, currentGroup}) {

    const [relations, setRelations] = useState([]);
    const [transactionTotal, setTransactionTotal] = useState(0);

    useEffect(() => { // Make the relations on component mount
        let newRelations = [];
        let bystanders = [];
        let negativeUsers = [];
        let positiveUsers = [];
        let totalOwed = 0;
        let totalPaid = 0;

        // First, get all fronters and all payers...
        // Also update totals
        for (const key of weightedUsers) {
            const user = key[1];
            totalPaid += user.paid;
            if (user.paid === user.shouldHavePaid) {
                // This is a bystander lol
                bystanders.push(key);
            } else {
                if (user.paid > user.shouldHavePaid) {
                    // This person is owed money
                    totalOwed += user.paid - user.shouldHavePaid;
                    negativeUsers.push(key);
                } else {
                    // This person owes money
                    positiveUsers.push(key);
                }
            }
        }

        // Create a map of the ratios between a how much a user is owed and the total amount owed
        const ratioMap = new Map();
        for (const key of negativeUsers) {
            const user = key[1];
            ratioMap.set(key[0], (user.paid - user.shouldHavePaid) / totalOwed);
        }

        function getName(uid) {
            for (const person of peopleInvolved) {
                if (person.id === uid) {
                    return person.displayName;
                }
            }
        }

        function getSrc(uid) {
            for (const person of peopleInvolved) {
                if (person.id === uid) {
                    return person.pfpUrl;
                }
            }
        }

        // Now create relations from all people who owe money to those who are owed
        for (const senderKey of positiveUsers) {
            const senderId = senderKey[0];
            const sender = senderKey[1];
            for (const receiverKey of negativeUsers) {
                const receiverId = receiverKey[0];
                const amountToSend = (sender.shouldHavePaid - sender.paid) * ratioMap.get(receiverId);
                const relation = new TransactionRelation(senderId, receiverId, amountToSend);
                relation.setToDisplayName(getName(receiverId));
                relation.setFromDisplayName(getName(senderId));
                relation.setToPfpUrl(getSrc(receiverId));
                relation.setFromPfpUrl(getSrc(senderId));
                newRelations.push(relation);
            }
        }
        setRelations(newRelations);
        setTransactionTotal(totalPaid);
    }, [weightedUsers, peopleInvolved])

    async function handleSubmit() {
        // Create a new transction manager for this transaction
        const transactionManager = DBManager.getTransactionManager();
        let newTransactionUsers = [];
        let userRelationsMap = new Map();
        const newTransactionBalances = new Map();
        const newTransactionCurrentBalances = new Map();
        for (const relation of relations) {
            // Get toUser and fromUser if they already exist
            let toBal = newTransactionBalances.get(relation.to.id) ? newTransactionBalances.get(relation.to.id) : 0;
            let fromBal = newTransactionBalances.get(relation.from.id) ? newTransactionBalances.get(relation.from.id) : 0;
            // Add relation to user map
            toBal += relation.amount;
            fromBal -= relation.amount;
            let toUserRelationsArray = userRelationsMap.get(relation.to.id) ? userRelationsMap.get(relation.to.id) : [];
            let fromUserRelationsArray = userRelationsMap.get(relation.from.id) ? userRelationsMap.get(relation.from.id) : [];
            // Update maps
            newTransactionBalances.set(relation.to.id, toBal);
            newTransactionBalances.set(relation.from.id, fromBal);
            // Initial balance is always going to be bal, but we have to do some investigative work to figure out
            // What the current balance should be (this user may have credit towards them from somewhere else)
            const toUserManager = DBManager.getUserManager(relation.to.id);
            const toRelation = await toUserManager.getRelationWithUser(relation.from.id);
            let toCurrentBalance = toBal;
            let fromCurrentBalance = fromBal;
            relation.setInitialAmount(relation.amount);
            if (toRelation) {
                // If there's an outstanding relation between these two users
                // Find out how much needs to be settled to combine them
                const settleAmount = Math.abs(toRelation.amount) > relation.amount ? relation.amount : Math.abs(toRelation.amount);
                if (toRelation.amount < 0) {
                    // If the user receiving money aleady owes money
                    await toUserManager.settleWithUser(relation.from.id, settleAmount); // They need to settle their debt first
                    toCurrentBalance -= settleAmount;
                    fromCurrentBalance += settleAmount;
                    relation.setAmount(relation.amount - settleAmount);
                } else if (toRelation.amount > 0) {
                    //! WHAT THE FUCK
                    // No money gets sent here, but we have to cancel out the existing red with the new green
                    toCurrentBalance -= settleAmount;
                    fromCurrentBalance += settleAmount;
                    relation.setAmount(relation.amount - settleAmount);
                    if (relation.amount - settleAmount === 0) {
                        relation.setSettled(true);
                    }
                    /**
                     * Pausing here for the night. I'm clearly too tired to keep working.
                     * I think this is right, though! I spent nearly three and a half hours after
                     * dinner getting the transactions to compound correctly. This SHOULD
                     * be what I needed.
                     * - Joe 11/5/22 @ 3:25am — First On-Site meeting tomorrow at 10!
                     */
                    
                    
                }
            }
            toUserRelationsArray.push(relation);
            fromUserRelationsArray.push(relation);
            userRelationsMap.set(relation.to.id, toUserRelationsArray);
            userRelationsMap.set(relation.from.id, fromUserRelationsArray);
            newTransactionCurrentBalances.set(relation.to.id, toCurrentBalance);
            newTransactionCurrentBalances.set(relation.from.id, fromCurrentBalance);
            if (!newTransactionUsers.includes(relation.to.id)) {
                newTransactionUsers.push(relation.to.id);
            }
            if (!newTransactionUsers.includes(relation.from.id)) {
                newTransactionUsers.push(relation.from.id);
            }
            // Add relation to transaction
            transactionManager.addRelation(relation);
        }
        // Now that map is populated, we loop through it and add those transactionUsers to the transcationManager
        for (const userId of newTransactionUsers) {
            const transactionUser = new TransactionUser(userId);
            const initialBalance = newTransactionBalances.get(userId);
            const currentBalance = newTransactionCurrentBalances.get(userId);
            transactionUser.setInitialBalance(initialBalance);
            transactionUser.setCurrentBalance(currentBalance);
            transactionUser.setSettled(false);
            transactionManager.addUser(transactionUser);
        }
        // Transaction should now be populated with users
        // Add transaction data
        transactionManager.setTitle(transactionTitle);
        transactionManager.setTotal(transactionTotal);
        transactionManager.setGroup(currentGroup.length > 0 ? currentGroup : null)
        // Add transaction metadata
        transactionManager.setActive(true);
        transactionManager.setCreatedAt(new Date());
        transactionManager.setCreatedBy(SessionManager.getUserId());
        // Apply changes to transactionManager then add that transaction to new users (if push worked)
        let transactionRef = await transactionManager.push();    
        if (!transactionRef) {
            Debugger.log("Error: New transaction failed to push to database!");
            return;
        }
        const newTransactionId = transactionManager.getDocumentId(); 
        
        // Add new transaction to all users involved
        let pushError = false;
        for (const transcationUserId of newTransactionUsers) {
            const transactionUserManager = DBManager.getUserManager(transcationUserId);
            transactionUserManager.addTransaction(newTransactionId);
            await transactionUserManager.addRelationsFromTransaction(transactionManager);
            let success = await transactionUserManager.push();
            if (!success) {
                pushError = true;
            }
        }
        if (currentGroup.length > 0) {
            // There was a group selected!
            const groupManager = DBManager.getGroupManager(currentGroup);
            groupManager.addTransaction(newTransactionId);
            let success = await groupManager.push();
            if (!success) {
                pushError = true;
            }
        }
        if (!pushError) {
            // Take user to the new transaciton's page
            RouteManager.redirectToTransaction(newTransactionId);
        }
    }

    return (
        <div className="transaction-summary-page d-flex flex-column justify-content-between align-items-center w-100 h-100">
            <section className="header">
                <Typography variant="h1">Title: {transactionTitle}</Typography>
                <Typography variant="h1">Total Paid: ${transactionTotal}</Typography>
            </section>
            <TransactionRelationList relations={relations} />
            <Button variant="contained" onClick={() => {handleSubmit()}}>Submit</Button>
            <div className="hover-underline d-flex flex-row justify-content-center align-items-center p-3" onClick={() => setSplitPage("transaction-details")}>
                <ArrowBackIcon />
                <Typography marginLeft="5px" variant="subtitle1">Edit</Typography>
            </div>
        </div>
    )
}
