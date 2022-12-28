import { DBManager, Add, Remove, Set, Update } from "../dbManager";
import { ObjectManager } from "./objectManager";
import { SessionManager } from "../../sessionManager";

/**
 * Object Manager for transactions
 */
export class TransactionManager extends ObjectManager {
    constructor(_id) {
        super(DBManager.objectTypes.TRANSACTION, _id);
    }

    fields = {
        CREATEDBY: "createdBy",
        PAYMENTTYPE: "paymentType",
        AMOUNT: "amount",
        DATE: "date",
        TITLE: "title",
        BALANCES: "balances",
        GROUP: "group",
    }

    getEmptyData() {
        const empty = {
            paymentType: null,      // {PaymentType} What type of currency was used (BEER, PIZZA, USD)
            amount: null,           // {number} How many of that currency was used 
            date: null,             // {date} Timestamp of transaction
            title: null,            // {string} Title of transaction
            balances: {},           // {map<string, number>} Map relating usedIds to how much they are owed/owe for this transaction
            createdBy: null,        // {string} ID of user that created this transaction
            group: null,            // {number} ID of this transaction's group (if applicable)
        }
        return empty;
    }

    handleAdd(change, data) {
        switch(change.field) {
            case this.fields.PAYMENTTYPE:
            case this.fields.CREATEDBY:
            case this.fields.AMOUNT:
            case this.fields.DATE:
            case this.fields.TITLE:
            case this.fields.BALANCES:
            case this.fields.GROUP:
                super.logInvalidChangeType(change);
                return data;
            default:
                super.logInvalidChangeField(change);
                return data;
        }
    }

    handleRemove(change, data) {
        switch(change.field) {
            case this.fields.PAYMENTTYPE:
            case this.fields.CREATEDBY:
            case this.fields.AMOUNT:
            case this.fields.DATE:
            case this.fields.TITLE:
            case this.fields.BALANCES:
            case this.fields.GROUP:
                super.logInvalidChangeType(change);
                return data;
            default:
                super.logInvalidChangeField(change);
                return data;
        }
    }

    handleSet(change, data) {
        switch(change.field) {
            case this.fields.PAYMENTTYPE:
                data.paymentType = change.value;
                return data;
            case this.fields.CREATEDBY:
                data.createdBy = change.value;
                return data;
            case this.fields.AMOUNT:
                data.amount = change.value;
                return data;
            case this.fields.DATE:
                data.date = change.value;
                return data;
            case this.fields.TITLE:
                data.title = change.value;
                return data;
            case this.fields.GROUP:
                data.group = change.value;
                return data;
            case this.fields.BALANCES:
                super.logInvalidChangeType(change);
                return data;
            default:
                super.logInvalidChangeField(change);
                return data;
        }
    }

    async handleGet(field) {
        return new Promise(async (resolve, reject) => {
            if (!this.fetched) {
                await super.fetchData();
            }
            switch(field) {
                case this.fields.PAYMENTTYPE:
                    resolve(this.data.paymentType);
                    break;
                case this.fields.CREATEDBY:
                    resolve(this.data.createdBy);
                    break;
                case this.fields.AMOUNT:
                    resolve(this.data.amount);
                    break;
                case this.fields.DATE:
                    resolve(this.data.date);
                    break;
                case this.fields.TITLE:
                    resolve(this.data.title);
                    break;
                case this.fields.GROUP:
                    resolve(this.data.group);
                    break;
                case this.fields.BALANCES:
                    resolve(this.data.balances);
                    break;
                default:
                    super.logInvalidGetField(field);
                    resolve(null);
                    break;
            }
        })
    }
    

    handleUpdate(change, data) {
        switch(change.field) {
            case this.fields.BALANCES:
                data.relations[change.key] = change.value;
                return data;
            case this.fields.PAYMENTTYPE:
            case this.fields.CREATEDBY:
            case this.fields.AMOUNT:
            case this.fields.DATE:
            case this.fields.TITLE:
            case this.fields.GROUP:
                super.logInvalidChangeType(change);
                return data;
            default:
                super.logInvalidChangeField(change);
                return data;
        }
    }

    // ================= Get Operations ================= //

    async getPaymentType() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.PAYMENTTYPE).then((val) => {
                resolve(val);
            })
        })
    }

    async getCreatedBy() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.CREATEDBY).then((val) => {
                resolve(val);
            })
        })
    }

    async getAmount() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.AMOUNT).then((val) => {
                resolve(val);
            })
        })
    }

    async getDate() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.DATE).then((val) => {
                resolve(val);
            })
        })
    }

    async getTitle() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.TITLE).then((val) => {
                resolve(val);
            })
        })
    }

    async getGroup() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.GROUP).then((val) => {
                resolve(val);
            })
        })
    }
    
    // ================= Set Operations ================= //

    setPaymentType(newPaymentType) {
        const paymentTypeChange = new Set(this.fields.PAYMENTTYPE, newPaymentType);
        super.addChange(paymentTypeChange);
    }

    setCreatedBy(newCreatedBy) {
        const createdByChange = new Set(this.fields.CREATEDBY, newCreatedBy);
        super.addChange(createdByChange);
    }

    setAmount(newAmount) {
        const amountChange = new Set(this.fields.AMOUNT, newAmount);
        super.addChange(amountChange);
    }
    
    setDate(newDate) {
        const dateChange = new Set(this.fields.DATE, newDate);
        super.addChange(dateChange);
    }
    
    setTitle(newTitle) {
        const titleChange = new Set(this.fields.TITLE, newTitle);
        super.addChange(titleChange);
    }
    
    setGroup(newGroup) {
        const groupChange = new Set(this.fields.GROUP, newGroup);
        super.addChange(groupChange);
    }

    // ================= Add Operations ================= //
    // ================= Remove Operations ================= //
    // ================= Update Operations ================= //
    
    updateBalance(key, relation) {
        const balanceUpdate = new Update(this.fields.BALANCES, key, relation);
        super.addChange(balanceUpdate);
    }
    
    // ================= Sub-Object Functions ================= //

    /**
     * Get group manager for this transaction
     * @returns a promise resolved with the GroupManager or null if there's no group attached to this transaction
     */
    async getGroupManager() {
        return new Promise(async (resolve, reject) => {
            const group = await this.getGroup();
            if (group) {
                resolve(DBManager.getGroupManager(group));
            } else {
                resolve(null);
            }
        })
    }

    /**
     * Get a certain user in this transaction
     * @param userId id of user to lookup
     */
    async getUser(userId) {
        return new Promise(async (resolve, reject) => {
            const allUsers = await this.getUsers();
            let retVal = null;
            for (const u of allUsers) {
                if (u.id === userId) {
                    retVal = u;
                }
            }
            resolve(retVal);
        })
    }

    /**
     * Add this transaction to every user in its USER array
     * @returns a promise resolved with either true or false when the pushes are complete
     */
    async addToAllUsers() {
        return new Promise(async (resolve, reject) => {
            const transactionUsers = await this.getUsers();
            for (const transactionUser of transactionUsers) {
                // Get a user manager and add the transaction
                const transactionUserManager = SessionManager.getUserManagerById(transactionUser.id);
                transactionUserManager.addTransaction(this.getDocumentId());
                // Push changes to userManager
                const pushSuccessful = await transactionUserManager.push();
                // Make sure pushes to userManager worked
                if (!pushSuccessful) {
                    this.debugger.logWithPrefix("Error: User manager failed to push to database");
                    resolve(false);
                }
            }
            // If we made it this far, we succeeded
            resolve(true);
        })
    }

    /**
     * Remove this transaction from every user in its USER array
     * @returns a promise resolved with either true or false when the pushes are complete
     */
    async removeFromAllUsers() {
        return new Promise(async (resolve, reject) => {
            const transactionUsers = await this.getUsers();
            const userIds = await this.getUserIds();
            for (const transactionUser of transactionUsers) {
                // Get a user manager and remove the transaction
                const transactionUserManager = SessionManager.getUserManagerById(transactionUser.id);
                transactionUserManager.removeTransaction(this.getDocumentId());
                // todo: maybe find a better way to log deletions in history? 
                await transactionUserManager.removeRelationsByTransaction(this.getDocumentId(), userIds); 
                // Push changes to userManager
                const pushSuccessful = await transactionUserManager.push();
                // Make sure pushes to userManager worked
                if (!pushSuccessful) {
                    this.debugger.logWithPrefix("Error: User manager failed to push to database");
                    resolve(false);
                }
            }
            // If we made it this far, we succeeded
            resolve(true);
        })
    }

    /**
     * Remove this transaction from the group that it references (if applicable)
     * @returns a promise resolved true if the transaction had a group and false if not
     */
    async removeFromGroup() {
        return new Promise(async (resolve, reject) => {
            const groupManager = await this.getGroupManager();
            if (groupManager) {
                // This transcation was part of a group
                await groupManager.removeTransaction(this.getDocumentId());
                await groupManager.push();
                resolve(true);
            } else {
                resolve(false);
            }
        })
    }

    /**
     * Get wheteher or not the relation between two users is settled in this transaction
     * @param {string} user1 id of first user
     * @param {string} user2 id of second user 
     * @returns a promise resolved with a boolean whether or not the two users are settled in this transction (or null if a relation does not exist)
     */
    async areUsersSettled(user1, user2) {
        return new Promise(async (resolve, reject) => {
            const relation = await this.getRelationForUsers(user1, user2);
            if (relation) {
                resolve(relation.amount === 0);
            } else {
                resolve(null)
            }
        })
    }

    /**
     * Remove this transaction from every user in its USER array
     * Remove all relations related to this transaction in all users
     * @returns a promise resolved with either true or false when the pushes are complete
     */
    async cleanDelete() {
        console.log("cd")
        return new Promise(async (resolve, reject) => {
            await this.removeFromAllUsers();
            await this.removeFromGroup();
            await this.deleteDocument();
            // If we made it this far, we succeeded
            resolve(true);
        })
    }

    /**
     * Get this transaction's relation between two users
     * @param {string} user1 id of first user 
     * @param {string} user2 id of second user 
     * @returns a promise resolved with either true or false when the pushes are complete
     */
    async getRelationForUsers(user1, user2) {
        console.log(user1)
        console.log(user2)
        return new Promise(async (resolve, reject) => {
            const transactionRelations = await this.getRelations();
            let returnRelation = null;
            for (const r of transactionRelations) {
                if (r.hasUser(user1) && r.hasUser(user2)) {
                    returnRelation = r;
                    break;
                }
            }
            resolve(returnRelation);
        })
    }

    /**
     * Find out whether a user initially paid for a transcation
     * @param {string} userId id of user to check
     * @returns a promise resolve with a boolean whether or not this user iniaially paid for a transcation
     */
    async userIsPayer(userId) {
        return new Promise(async (resolve, reject) => {
            const user = await this.getUser(userId);
            resolve(user ? user.initialBalance < 0 : false);
        })
    }

    /**
     * Find out whether a user initially paid for a transcation
     * @param {string} userId id of user to check
     * @returns a promise resolve with a boolean whether or not this user iniaially paid for a transcation
     */
    async userIsFronter(userId) {
        return new Promise(async (resolve, reject) => {
            const user = await this.getUser(userId);
            resolve(user.initialBalance > 0);
        })
    }
}