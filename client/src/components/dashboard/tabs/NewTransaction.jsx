// Library imports
import { useState, useEffect } from 'react';
import { Button, Select, InputLabel, FormControl, InputAdornment, Input, MenuItem, Typography, TextField, CircularProgress, Paper, TableContainer, TableHead, Table, TableRow, TableCell, TableBody, Tooltip, Checkbox, IconButton } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import GroupsIcon from '@mui/icons-material/Groups';
import StartIcon from '@mui/icons-material/Start';

// Component imports
import { TransactionRelationList } from "../../resources/Transactions";
import { OutlinedCard } from "../../resources/Surfaces";
import { SectionTitle } from "../../resources/Labels";

// API imports
import { SessionManager } from "../../../api/sessionManager";
import { RouteManager } from "../../../api/routeManager";
import { DBManager } from "../../../api/db/dbManager";
import { AvatarIcon, AvatarToggle } from '../../resources/Avatars';
import { sortByDisplayName } from '../../../api/sorting';
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
        total: 0,
        title: ""
    });
    const [newTransactionPage, setNewTransactionPage] = useState("users"); // Which page of new transaction are we on

    /**
     * Adds a user to newTransactionState along with their pfpUrl and displayName
     * @param {string} userId id of user to add
     */
    async function addTransactionUser(userId) {
        let newUsers = newTransactionState.users;
        const userManager = DBManager.getUserManager(userId);
        let name = await userManager.getDisplayName(); 
        let url = await userManager.getPfpUrl();
        newUsers.push({id: userId, displayName: name, pfpUrl: url});
        setNewTransactionState({
            users: newUsers,
            group: newTransactionState.group,
            currency: newTransactionState.currency,
            total: newTransactionState.total,
            title: newTransactionState.title
        }) 
    }

    /**
     * Removes a user from newTransactionState
     * @param {string} userId id of user to add
     */
    async function removeTransactionUser(userId) {
        const newUsers = newTransactionState.users.filter(u => u.id !== userId);
        setNewTransactionState({
            users: newUsers,
            group: newTransactionState.group,
            currency: newTransactionState.currency,
            total: newTransactionState.total,
            title: newTransactionState.title
        }) 
    }
    function renderPage() {
        switch (newTransactionPage) {
            case "users":
                return <UsersPage addUser={addTransactionUser} removeUser={removeTransactionUser} newTransactionState={newTransactionState}/>;
            default:
                return <div>Error: invalid transaction page!</div>
        }
    }

    return (
        <div className="d-flex flex-column align-items-center justify-content-start w-100">
            <h1>{ newTransactionState.title ? newTransactionState.title : "New Expense" }</h1>
            { renderPage() }
        </div>
    )
}

function UsersPage({addUser, removeUser, newTransactionState}) {
    
    const [userData, setUserData] = useState({
        recents: [],
        groups: [],
        friends: []
    });
    const [checkedFriends, setCheckedFriends] = useState([]);

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
                newGroups.push({id: groupId, name: groupName, memberCount: groupMemberCount});
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

    function renderGroups() {
        return userData.groups.map(group => {
            return (
                <OutlinedCard>
                    <div key={"group-" + group.id} className="d-flex flex-row justify-content-between">
                        <div className="d-flex flex-row align-items-center gap-10">
                            <GroupsIcon />
                            <div>{group.name}</div>
                        </div>
                        <IconButton>
                            <StartIcon />
                        </IconButton>
                    </div>
                </OutlinedCard>
            )
        })
    }

    function handleFriendCheckbox(e, id) {
        let newCheckedFriends = new Array(checkedFriends);
        if (newCheckedFriends.indexOf(id) !== -1) {
            newCheckedFriends = newCheckedFriends.filter(f => f.id === id);
            setCheckedFriends(newCheckedFriends);
        } else {
            newCheckedFriends.push(id); 
            setCheckedFriends(newCheckedFriends);
        }
    }
    
    function renderFriends() {
        return userData.friends.map(friend => {
            return (
                <OutlinedCard>
                    <div key={"friend-" + friend.id} className="d-flex flex-row justify-content-between">
                        <div className="d-flex flex-row align-items-center gap-10">
                            <AvatarIcon displayName={friend.displayName} src={friend.pfpUrl}/>
                            <div>{friend.displayName}</div>
                        </div>
                        <Checkbox icon={<AddCircleOutlineIcon />} checkedIcon={<AddCircleIcon />} onClick={e => handleFriendCheckbox(e, friend.id)} />
                    </div>
                </OutlinedCard>
            )
        })
    }
    
    return (
        <div className="d-flex flex-column w-50 align-items-center gap-10">
            <div className="vh-60 w-100">
                <SectionTitle title="Recent"/>
                { renderRecents() }
                <SectionTitle title="Groups"/>
                { renderGroups() }
                <SectionTitle title="Friends"/>
                { renderFriends() }
            </div>
            <Button variant="contained" color="primary" className="w-50" disabled={newTransactionState.users.length <= 0}>Next</Button>
        </div>

    )
}