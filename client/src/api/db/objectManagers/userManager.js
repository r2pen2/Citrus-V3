import { DBManager, Add, Remove, Set } from "../dbManager";
import { ObjectManager } from "./objectManager";
import { TransactionRelation } from "./transactionManager";
import { SessionManager } from "../../sessionManager";
import { sortByDate } from "../../sorting";
import { getDateString } from "../../strings";

/**
 * Object Manager for users
 */
export class UserManager extends ObjectManager {
    
    // Optional data param for loading currentUserManager from localstorage
    constructor(_id, _data) {
        super(DBManager.objectTypes.USER, _id);
        if (_data) {
            this.data = _data;
            this.fetched = true;
        }
    }
    
    fields = {
        FRIENDS: "friends",
        GROUPS: "groups",
        RELATIONS: "relations",
        CREATEDAT: "createdAt",
        EMAILVERIFIED: "emailVerified",
        LASTLOGINAT: "lastLoginAt",
        DISPLAYNAME: "displayName",
        EMAIL: "email",
        PHONENUMBER: "phoneNumber",
        PFPURL: "pfpUrl",
    }

    getEmptyData() {
        const empty = {
            friends: [],                    // {array} IDs of friends the user has added
            groups: [],                     // {array} IDs of groups the user is in
            relations: [],                  // {array} List of UserRelations for user
            metadata: {                     // {map} Metadata associated with user
                createdAt: null,            // --- {date} When the user was created
                emailVerified: null,        // --- {boolean} Whether or not the user is email verified
                lastLoginAt: null,          // --- {date} Timestamp of last login
            },  
            personalData: {                 // {map} Personal data associated with user
                displayName: null,          // --- {string} User's display name
                email: null,                // --- {string} User's email address
                phoneNumber: null,          // --- {PhoneNumber} User's phone number
                pfpUrl: null,    // --- {string} URL of user's profile photo
            },
        }
        return empty;
    }

    handleAdd(change, data) {
        switch(change.field) {
            case this.fields.FRIENDS:
                if (!data.friends.includes(change.value)) {    
                    data.friends.push(change.value);
                }
                return data;
            case this.fields.GROUPS:
                if (!data.groups.includes(change.value)) {    
                    data.groups.push(change.value);
                }
                return data;
            case this.fields.RELATIONS:
                data.relations.push(change.value.toJson());
                return data;
            case this.fields.CREATEDAT:
            case this.fields.EMAILVERIFIED:
            case this.fields.LASTLOGINAT:
            case this.fields.DISPLAYNAME:
            case this.fields.EMAIL:
            case this.fields.PHONENUMBER:
            case this.fields.PFPURL:
                super.logInvalidChangeType(change);
                return data;
            default:
                super.logInvalidChangeField(change);
                return data;
        }
    }

    handleRemove(change, data) {
        switch(change.field) {
            case this.fields.FRIENDS:
                data.friends = data.friends.filter(friend => friend !== change.value);
                return data;
            case this.fields.GROUPS:
                data.groups = data.groups.filter(group => group !== change.value);
                return data;
            case this.fields.RELATIONS:
                data.relations = data.relations.filter(relation => relation.user !== change.value);
                return data;
            case this.fields.CREATEDAT:
            case this.fields.EMAILVERIFIED:
            case this.fields.LASTLOGINAT:
            case this.fields.DISPLAYNAME:
            case this.fields.EMAIL:
            case this.fields.PHONENUMBER:
            case this.fields.PFPURL:
                super.logInvalidChangeType(change);
                return data;
            default:
                super.logInvalidChangeField(change);
                return data;
        }
    }

    handleSet(change, data) {
        switch(change.field) {
            case this.fields.CREATEDAT:
                data.metadata.createdAt = change.value;
                return data;
            case this.fields.EMAILVERIFIED:
                data.metadata.emailVerified = change.value;
                return data;
            case this.fields.LASTLOGINAT:
                data.metadata.lastLoginAt = change.value;
                return data;
            case this.fields.DISPLAYNAME:
                data.personalData.displayName = change.value;
                return data;
            case this.fields.EMAIL:
                data.personalData.email = change.value;
                return data;
            case this.fields.PHONENUMBER:
                data.personalData.phoneNumber = change.value;
                return data;
            case this.fields.PFPURL:
                data.personalData.pfpUrl = change.value;
                return data;
            case this.fields.FRIENDS:
            case this.fields.GROUPS:
            case this.fields.RELATIONS:
                super.logInvalidChangeType(change);
                return data;
            default:
                super.logInvalidChangeField(change);
                return data;
        }
    }

    async handleGet(field) {
        return new Promise(async (resolve, reject) => {
            if (!this.fetched || !this.data) {
                await super.fetchData();
            }
            switch(field) {
                case this.fields.CREATEDAT:
                    resolve(this.data.metadata.createdAt);
                    break;
                case this.fields.EMAILVERIFIED:
                    resolve(this.data.metadata.emailVerified);
                    break;
                case this.fields.LASTLOGINAT:
                    resolve(this.data.metadata.lastLoginAt);
                    break;
                case this.fields.DISPLAYNAME:
                    resolve(this.data.personalData.displayName);
                    break;
                case this.fields.EMAIL:
                    resolve(this.data.personalData.email);
                    break;
                case this.fields.PHONENUMBER:
                    resolve(this.data.personalData.phoneNumber);
                    break;
                case this.fields.PFPURL:
                    if (this.data.personalData.pfpUrl) {
                        resolve(this.data.personalData.profilePictureUrl);
                        break;
                    } else {
                        resolve("https://robohash.org/" + this.documentId);
                        break;
                    }
                case this.fields.FRIENDS:
                    resolve(this.data.friends);
                    break;
                case this.fields.GROUPS:
                    resolve(this.data.groups);
                    break;
                case this.fields.RELATIONS:
                    let relationArray = [];
                    for (const jsonRelation of this.data.relations) {
                        const rel = new UserRelation(jsonRelation.user, jsonRelation);
                        relationArray.push(rel)
                    }
                    resolve(relationArray);
                    break;
                default:
                    super.logInvalidGetField(field);
                    resolve(null);
                    break;
            }
        })
    }

    // ================= Get Operations ================= //

    async getFriends() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.FRIENDS).then((val) => {
                resolve(val);
            })
        })
    }

    async getGroups() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.GROUPS).then((val) => {
                resolve(val);
            })
        })
    }

    async getCreatedAt() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.CREATEDAT).then((val) => {
                resolve(val);
            })
        })
    }

    async getEmailVerified() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.EMAILVERIFIED).then((val) => {
                resolve(val);
            })
        })
    }

    async getLastLoginAt() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.LASTLOGINAT).then((val) => {
                resolve(val);
            })
        })
    }

    async getDisplayName() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.DISPLAYNAME).then((val) => {
                resolve(val);
            })
        })
    }

    async getEmail() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.EMAIL).then((val) => {
                resolve(val);
            })
        })
    }

    async getPhoneNumber() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.PHONENUMBER).then((val) => {
                resolve(val);
            })
        })
    }

    async getPfpUrl() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.pfpUrl).then((val) => {
                resolve(val);
            })
        })
    }

    async getRelations() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.RELATIONS).then((val) => {
                resolve(val);
            })
        })
    }

    async getRelationWithUser(userId) {
        return new Promise(async (resolve, reject) => {
            const allRelations = await this.getRelations();
            let found = false;
            for (const r of allRelations) {
                if (r.user === userId) {
                    found = true;
                    resolve(new UserRelation(r.user, r));
                }
            }
            if (!found) {
                resolve(null);
            }
        })
    }

    async getSortedRelations() {
        return new Promise(async (resolve, reject) => {
            const allRelations = await this.getRelations();
            // get all positive and negative relations
            let positiveRelations = [];
            let negativeRelations = [];
            for (const relation of allRelations) {
                if (relation.amount > 0) {
                    positiveRelations.push(relation);
                } else if (relation.amount < 0 ){
                    negativeRelations.push(relation);
                }
            }
            resolve({
                positive: positiveRelations,
                negative: negativeRelations,
            });
        })
    }

    // ================= Set Operations ================= //
    setCreatedAt(newCreatedAt) {
        const createdAtChange = new Set(this.fields.CREATEDAT, newCreatedAt);
        super.addChange(createdAtChange);
    }
    
    setEmailVerified(newEmailVerified) {
        const emailVerifiedChange = new Set(this.fields.EMAILVERIFIED, newEmailVerified);
        super.addChange(emailVerifiedChange);
    }
    
    setLastLoginAt(newLastLoginAt) {
        const loginAtChange = new Set(this.fields.LASTLOGINAT, newLastLoginAt);
        super.addChange(loginAtChange);
    }

    setDisplayName(newDisplayName) {
        const displayNameChange = new Set(this.fields.DISPLAYNAME, newDisplayName);
        super.addChange(displayNameChange);
    }
    
    setEmail(newEmail) {
        const emailChange = new Set(this.fields.EMAIL, newEmail);
        super.addChange(emailChange);
    }

    setPhoneNumber(newPhoneNumber) {
        const phoneNumberChange = new Set(this.fields.PHONENUMBER, newPhoneNumber);
        super.addChange(phoneNumberChange);
    }
    
    setPfpUrl(newProfilePictureUrl) {
        const photoUrlChange = new Set(this.fields.PROFILEPICTUREURL, newProfilePictureUrl);
        super.addChange(photoUrlChange);
    }

    // ================= Add Operations ================= //
    addFriend(friendId) {
        const friendAddition = new Add(this.fields.FRIENDS, friendId);
        super.addChange(friendAddition);
    }
    
    addGroup(groupId) {
        const groupAddition = new Add(this.fields.GROUPS, groupId);
        super.addChange(groupAddition);
    }

    addRelation(relation) {
        const relationAddition = new Add(this.fields.RELATIONS, relation);
        super.addChange(relationAddition);
    }

    async addRelationsFromTransaction(transactionManager) {
        return new Promise(async (resolve, reject) => {
            // We're going to assume that this transactionManager has data loaded into it already
            const transactionRelations = await transactionManager.getRelations();
            const transactionTitle = await transactionManager.getTitle();
            const transactionId = await transactionManager.getDocumentId();
            for (const relation of transactionRelations) {
                // We need to translate this into a UserRelation
                if (relation.to.id === this.getDocumentId() || relation.from.id === this.getDocumentId()) {
                    // This user is involved in this relation
                    const fronter = relation.to.id === this.getDocumentId();
                    const amtDelta = fronter ? relation.amount : relation.amount * -1;
                    // Create history entry
                    const newHistory = new UserRelationHistory();
                    newHistory.setTransactionTitle(transactionTitle);
                    newHistory.setTranscationId(transactionId);
                    newHistory.setAmountChange(amtDelta);
                    // Add or update relation
                    const relationWithUser = await this.getRelationWithUser(fronter ? relation.from.id : relation.to.id);
                    if (relationWithUser) {
                        // If this relation exists, make edits
                        relationWithUser.addHistory(newHistory);
                        this.updateUserRelation(relationWithUser);
                    } else {
                        // This is a new relation
                        const newRelation = new UserRelation(fronter ? relation.from.id : relation.to.id);
                        newRelation.addHistory(newHistory);
                        this.addRelation(newRelation);
                    }
                }
            }    
            resolve(true);
        })
    }

    // ================= Remove Operations ================= //
    removeFriend(friendId) {
        const friendRemoval = new Remove(this.fields.FRIENDS, friendId);
        super.addChange(friendRemoval);
    }
    
    removeGroup(groupId) {
        const groupRemoval = new Remove(this.fields.GROUPS, groupId);
        super.addChange(groupRemoval);
    }

    removeRelation(relationUserId) {
        const relationRemoval = new Remove(this.fields.RELATIONS, relationUserId);
        super.addChange(relationRemoval);
    }

    /**
     * Delete all relation history associated with a transaction
     * @param {string} transactionId id of transction to remove relations for
     * @param {array<string>} userIds ids of all users involved in the transaction that we're deleting
     * @returns a promise resolved true when pushes are complete
     */
    async removeRelationsByTransaction(transactionId, userIds) {
        return new Promise(async (resolve, reject) => {
            const relations  = await this.getRelations();
            const transactionManager = DBManager.getTransactionManager(transactionId);
            console.log(userIds);
            console.log(transactionId);
            for (const relation of relations) {
                // Check if this relation has one of the users from this transaction
                if (userIds.includes(relation.user)) {
                    // We have a relation with this user! Edit history.
                    const transactionRelation = await transactionManager.getRelationForUsers(relation.user, this.getDocumentId());
                    if (transactionRelation)  {
                        // Not null, meaning that there is a relation between these two users
                        const amtChange = transactionRelation.to.id === this.getDocumentId() ? transactionRelation.amount * -1 : transactionRelation.amount;
                        const newHistory = new UserRelationHistory();
                        newHistory.setAmountChange(amtChange);
                        newHistory.setTransactionTitle("Deleted transaction");
                        newHistory.setTranscationId(null);
                        relation.addHistory(newHistory);
                        this.updateUserRelation(relation);
                    }
                }
            }
            resolve(true);
        })
    }

    // ================= Misc. Methods ================= //
    /**
     * Get a user's initials by displayName
     * @returns a promise resolved with the user's initials
     */
    async getInitials() {
        return new Promise(async (resolve, reject) => {
            const fullName = await this.getDisplayName()
            if (fullName) {
                resolve(fullName.charAt(0))
            } else {
                resolve("?");
            }
        })
    }

    /**
     * Send money to another user and handle all transctions that are caught in the cross-fire
     * @param {string} userId id of user to settle with
     * @param {number} settleAmount amount of money to send other user 
     * @returns a promise resolved true when the pushes are complete
     */
    async settleWithUser(userId, settleAmount) {
        console.log("Settle")
        return new Promise(async (resolve, reject) => {
            // We'll go down the list of transaction history to find the oldest unsettled payments
            // Iterate through the list until we are out of money or out of transactions
            const otherUserManager = DBManager.getUserManager(userId);
            // Get list of relations between current user and other user
            const relation = await this.getRelationWithUser(userId);
            // First let's check if this user even owes money...
            let moneyLeft = settleAmount;
            let unsettledHistory = [];
            // Get the relation history
            const history = sortByDate(relation.getHistory());
            // Find the unsettled histories in order of age (oldest first)
            for (const entry of history) {
                if (entry.transactionId) {
                    const entryTransactionManager = DBManager.getTransactionManager(entry.transactionId);
                    const usersSettled = await entryTransactionManager.areUsersSettled(SessionManager.getUserId(), userId);
                    const userIsPayer = await entryTransactionManager.userIsPayer(SessionManager.getUserId());
                    if (!usersSettled && userIsPayer) {
                        unsettledHistory.push(entryTransactionManager);
                    }
                }
            }
            console.log(unsettledHistory);
            // Start fulfilling these relations in their respective transactions until there's no money left (transactions left)
            let fulfilledEntries = [];
            let lastEntry = null;
            for (const unsettledTransaction of unsettledHistory) {
                const transactionRelation = await unsettledTransaction.getRelationForUsers(userId, SessionManager.getUserId()); // This is the relation in this transaction
                if (moneyLeft >= Math.abs(transactionRelation.amount)) {
                    moneyLeft = moneyLeft - transactionRelation.amount;
                    fulfilledEntries.push(unsettledTransaction);
                } else {
                    lastEntry = unsettledTransaction;
                    break;
                }
            }
            // Create a positive relation with remaining amount
            if (!lastEntry && moneyLeft > 0) {
                // From this user's perspective...
                const positiveRelation = new UserRelation(userId);
                const positiveHistory = new UserRelationHistory();
                positiveHistory.setAmountChange(moneyLeft);
                positiveHistory.setSettled(false);
                positiveRelation.addHistory(positiveHistory);
                // Add this relation to current user
                this.updateUserRelation(positiveRelation);
                // From the other user's perspective...
                const negativeRelation = new UserRelation(this.getDocumentId());
                const negativeHistory = new UserRelationHistory();
                negativeHistory.setAmountChange(moneyLeft * -1);
                negativeHistory.setSettled(false);
                negativeRelation.addHistory(negativeHistory);
                // Add this relation to other user
                otherUserManager.updateUserRelation(negativeRelation);
            }
            // handle all fulfilled entries
            for (const fulfilledTransaction of fulfilledEntries) {
                console.log(fulfilledTransaction);
                // Completely settle users on this transaction
                const transactionRelation = await fulfilledTransaction.getRelationForUsers(userId, SessionManager.getUserId());
                await this.settleWithUserInTransaction(userId, fulfilledTransaction.getDocumentId(), transactionRelation.amount);
            }
            // If there's a "lastEntry", replace it on both users and the transaction
            if (lastEntry) {
                // Handle on users
                await this.settleWithUserInTransaction(userId, lastEntry.getDocumentId(), moneyLeft);
            }
            // push changes to users
            await this.push();
            await otherUserManager.push();
            resolve(true);
        })
    }

    /**
     * Send money to another user in the context of a transaction
     * @param {string} userId id of user to settle with
     * @param {string} transactionId of transaction to settle in
     * @param {number} settleAmount amount of money to send other user 
     */
    async settleWithUserInTransaction(userId, transactionId, settleAmount) {
        return new Promise(async (resolve, reject) => {
            const otherUserManager = DBManager.getUserManager(userId);
            const transactionManager = DBManager.getTransactionManager(transactionId);
            const transactionTitle = await transactionManager.getTitle();
            const transactionRelation = await transactionManager.getRelationForUsers(userId, SessionManager.getUserId());
            // Check whether or not this amount will fully settle these two users:
            if (settleAmount >= transactionRelation.amount) {
                // This is enough to close these two users out in this transaction!
                const relationWithUser = await this.getRelationWithUser(userId);
                const fromUserHistory = new UserRelationHistory();
                fromUserHistory.setTransactionTitle(transactionTitle);
                fromUserHistory.setTranscationId(transactionId);
                fromUserHistory.setSettled(true);
                fromUserHistory.setAmountChange(settleAmount);
                relationWithUser.addHistory(fromUserHistory);
                this.updateUserRelation(relationWithUser);
                const relationWithCurrentUser = await otherUserManager.getRelationWithUser(this.getDocumentId());
                const toUserHistory = new UserRelationHistory();
                toUserHistory.setTransactionTitle(transactionTitle);                
                toUserHistory.setTranscationId(transactionId);                      
                toUserHistory.setSettled(true);                                     
                toUserHistory.setAmountChange(settleAmount);
                relationWithCurrentUser.addHistory(toUserHistory);
                otherUserManager.updateUserRelation(relationWithCurrentUser);
                // Update this transaction's relation amt
                transactionRelation.setAmount(0);
                transactionManager.removeRelation(transactionRelation);
                transactionManager.addRelation(transactionRelation);
                // Also update user debts in the transaction to reflect this payment
                const transactionFromUser = await transactionManager.getUser(this.getDocumentId());
                const transactionToUser = await transactionManager.getUser(userId);
                transactionFromUser.setCurrentBalance(0);                           // Update user balances
                transactionToUser.setCurrentBalance(0);                             // 
                transactionFromUser.setSettled(true);                               // Update user settled statuses
                transactionToUser.setSettled(true);                                 // 
                transactionManager.removeUser(transactionFromUser.id);      // Remove old version of users
                transactionManager.removeUser(transactionToUser.id);        // 
                transactionManager.addUser(transactionFromUser);            // Add new versions of users
                transactionManager.addUser(transactionToUser);              //
                await transactionManager.push();                            // Push changes 
            } else {
                // This isn't enough money to close these two users out, but we'll update their counts
                const relationWithUser = await this.getRelationWithUser(userId);
                const fromUserHistory = new UserRelationHistory();
                fromUserHistory.setTransactionTitle(transactionTitle);
                fromUserHistory.setTranscationId(transactionId);
                fromUserHistory.setAmountChange(settleAmount);
                relationWithUser.addHistory(fromUserHistory);
                this.updateUserRelation(relationWithUser);
                const relationWithCurrentUser = await otherUserManager.getRelationWithUser(this.getDocumentId());
                const toUserHistory = new UserRelationHistory();
                toUserHistory.setTransactionTitle(transactionTitle);                
                toUserHistory.setTranscationId(transactionId);                      
                toUserHistory.setAmountChange(settleAmount * -1);
                relationWithCurrentUser.addHistory(toUserHistory);
                otherUserManager.updateUserRelation(relationWithCurrentUser);
                const newTransactionRelation = new TransactionRelation(transactionRelation.from.id, transactionRelation.to.id, transactionRelation.amount - settleAmount, transactionRelation.id, transactionRelation.from, transactionRelation.to, transactionRelation.initialAmount);
                // Apply changes on transaction
                const transactionFromUser = await transactionManager.getUser(this.getDocumentId());
                const transactionToUser = await transactionManager.getUser(userId);
                transactionFromUser.setCurrentBalance(transactionFromUser.currentBalance + settleAmount); 
                transactionToUser.setCurrentBalance(transactionToUser.currentBalance - settleAmount);
                transactionFromUser.setSettled(transactionFromUser.currentBalance === 0);         // Update user settled statuses
                transactionToUser.setSettled(transactionToUser.currentBalance === 0);           // 
                transactionManager.removeUser(transactionFromUser.id);                  // Remove old version of users
                transactionManager.removeUser(transactionToUser.id);                    // 
                transactionManager.addUser(transactionFromUser);                        // Add new versions of users
                transactionManager.addUser(transactionToUser);                          //
                transactionManager.removeRelation(newTransactionRelation);                     // Remove old relation from transaction
                transactionManager.addRelation(newTransactionRelation);                            // Add new version of relation to transaction
                await transactionManager.push();                                        // Push changes to transaction
            }
            // push changes to users
            await this.push();
            await otherUserManager.push();
            resolve(true);
        })
    }

    /**
     * Updates a UserRelation object to reflect new changes
     * @param {UserRelation} userRelation UserRelation object to update
     */
    updateUserRelation(userRelation) {
        this.removeRelation(userRelation.user);
        this.addRelation(userRelation);
    }
}

export class UserRelation {
    constructor(_userRelation) {
        this.balance = _userRelation ? _userRelation.balance : 0;
        this.numTransactions = _userRelation ? _userRelation.numTransactions : 0;
        this.history = _userRelation ? _userRelation.history : [];
        this.lastInteracted = _userRelation ? _userRelation.lastInteracted : new Date();
    }

    addHistory(history) {
        this.amount = this.amount += history.amountChange;
        this.history.push(history.toJson());
    }

    getHistory() {
        let historyArray = [];
        for (const jsonHistory of this.history) {
            historyArray.push(new UserRelationHistory(jsonHistory));
        }
        return historyArray;
    }

    /**
     * Remove entry for a transactionId from history array
     * @param {string} transactionId id of transaction to erase from history
     */
    removeHistory(transactionId) {
        const history = this.getHistory();
        for (const h of history) {
            if (h.transactionId === transactionId) {
                // This is the entry to remove
                this.history = this.history.filter(entry => entry.transactionId !== transactionId);
                this.amount = this.amount - h.amountChange;
                break;
            }
        }
    }

    toJson() {
        return {
            balance: this.balance,
            numTransactions: this.numTransactions,
            history: this.history,
            lastInteracted: this.lastInteracted,
        }
    }
}

export class UserRelationHistory {
    constructor(_userRelationHistory) {
        this.paymentType = _userRelationHistory ? _userRelationHistory.paymentType : null;      // "Currency" used in this exchange (USD? BEER? PIZZA?)
        this.amount = _userRelationHistory ? _userRelationHistory.amount : null;                // How many of that currency was used in this exchange
        this.transaction = _userRelationHistory ? _userRelationHistory.transaction : null;      // ID of this exchange's transaction
        this.group = _userRelationHistory ? _userRelationHistory.group : false;             // ID of this exchange's group (if applicabale)
        this.date = _userRelationHistory ? _userRelationHistory.date : new Date();              // When this exchange occured
    }

    setTransaction(transactionId) {
        this.transaction = transactionId;
    }

    setPaymentType(paymentType) {
        this.paymentType = paymentType;
    }

    setAmount(amt) {
        this.amount = amt;
    }

    setGroup(groupId) {
        this.group = groupId;
    }

    setDate(date) {
        this.date = date;
    }
    
    toJson() {
        return {
            paymentType: this.paymentType,
            amount: this.amount,
            transaction: this.transcation,
            group: this.group,
            date: this.date,
        }
    }
}