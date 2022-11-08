import { DBManager, Set } from "../dbManager";
import { ObjectManager } from "./objectManager";

/**
 * Object Manager for transaction attempts
 */
export class TransactionAttemptManager extends ObjectManager {

    constructor(_id) {
        super(DBManager.objectTypes.TRANSACTIONATTEMPT, _id);
    }

    fields = {
        CREATEDAT: "createdAt",
        CREATORLOCATION: "creatorLocation",
        ISBOOKMARK: "isBookmark",
        ISINDIVIDUAL: "isIndividual",
        ISSTANDARD: "isStandard",
        ISTRANSACTION: "isTransaction",
        USEDSUGGESTION: "usedSuggestion"
    }

    getEmptyData() {
        const empty = {
            createdAt: null,        // {date} When this transaction attempt was created
            creatorAttrs: {         // {map} Attributes associated with the creator
                location: null,     // --- {geoPoint} Location of the creator
            },
            isBookmark: null,       // {boolean} Whether or not the attempt turned into a bookmark
            isIndividual: null,     // {boolean} Whether or not it was an indivitual transaction (or a group transaction)
            isStandard: null,       // {boolean} Whether or not the attempt was through standard pathway or shortcut
            isTransaction: null,    // {boolean} Whether or not this attempt turned into a full transaction
            usedSuggestion: null,   // {boolean} Whether or not they used a suggested group/individual (null if cancelled before this stage)
        }
        return empty;
    }

    handleAdd(change, data) {
        switch (change.field) {
            case this.fields.CREATEDAT:
            case this.fields.CREATORLOCATION:
            case this.fields.ISBOOKMARK:
            case this.fields.ISINDIVIDUAL:
            case this.fields.ISSTANDARD:
            case this.fields.ISTRANSACTION:
            case this.fields.USEDSUGGESTION:
                super.logInvalidChangeType(change);
                return data;
            default:
                super.logInvalidChangeField(change);
                return data;
        }
    }

    handleRemove(change, data) {
        switch (change.field) {
            case this.fields.CREATEDAT:
            case this.fields.CREATORLOCATION:
            case this.fields.ISBOOKMARK:
            case this.fields.ISINDIVIDUAL:
            case this.fields.ISSTANDARD:
            case this.fields.ISTRANSACTION:
            case this.fields.USEDSUGGESTION:
                super.logInvalidChangeType(change);
                return data;
            default:
                super.logInvalidChangeField(change);
                return data;
        }
    }

    handleSet(change, data) {
        switch (change.field) {
            case this.fields.CREATEDAT:
                data.createdAt = change.value;
                return data;
            case this.fields.CREATORLOCATION:
                data.creatorAttrs.location = change.value;
                return data;
            case this.fields.ISBOOKMARK:
                data.isBookmark = change.value;
                return data;
            case this.fields.ISINDIVIDUAL:
                data.isIndividual = change.value;
                return data;
            case this.fields.ISSTANDARD:
                data.isStandard = change.value;
                return data;
            case this.fields.ISTRANSACTION:
                data.isTransaction = change.value;
                return data;
            case this.fields.USEDSUGGESTION:
                data.usedSuggestion = change.value;
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
                case this.fields.CREATEDAT:
                    resolve(this.data.createdAt);
                    break;
                case this.fields.CREATORLOCATION:
                    resolve(this.data.creatorAttrs.location);
                    break;
                case this.fields.ISBOOKMARK:
                    resolve(this.data.isBookmark);
                    break;
                case this.fields.ISINDIVIDUAL:
                    resolve(this.data.isIndividual);
                    break;
                case this.fields.ISSTANDARD:
                    resolve(this.data.isStandard);
                    break;
                case this.fields.ISTRANSACTION:
                    resolve(this.data.isTransaction);
                    break;
                case this.fields.USEDSUGGESTION:
                    resolve(this.data.usedSuggestion);
                    break;
                default:
                    super.logInvalidGetField(field);
                    resolve(null);
                    break;
            }
        })
    }

    // ================= Get Operations ================= //
    async getCreatedAt() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.CREATEDAT).then((val) => {
                resolve(val);
            })
        })
    }

    async getCreatorLocation() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.CREATORLOCATION).then((val) => {
                resolve(val);
            })
        })
    }

    async getIsBookmark() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.ISBOOKMARK).then((val) => {
                resolve(val);
            })
        })
    }

    async getIsIndividual() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.ISINDIVIDUAL).then((val) => {
                resolve(val);
            })
        })
    }

    async getIsStandard() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.ISSTANDARD).then((val) => {
                resolve(val);
            })
        })
    }

    async getIsTransaction() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.ISTRANSACTION).then((val) => {
                resolve(val);
            })
        })
    }

    async getUsedSuggestion() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.USEDSUGGESTION).then((val) => {
                resolve(val);
            })
        })
    }

    // ================= Set Operations ================= //
    setCreatedAt(newCreatedAt) {
        const createdAtChange = new Set(this.fields.CREATEDAT, newCreatedAt);
        super.addChange(createdAtChange);
    }

    setCreatorLocation(newLocation) {
        const locationChange = new Set(this.fields.CREATORLOCATION, newLocation);
        super.addChange(locationChange);
    }
    
    setIsBookmark(newIsBookmark) {
        const isBookmarkChange = new Set(this.fields.ISBOOKMARK, newIsBookmark);
        super.addChange(isBookmarkChange);
    }
    
    setIsIndividual(newIsIndividual) {
        const isIndividualChange = new Set(this.fields.ISINDIVIDUAL, newIsIndividual);
        super.addChange(isIndividualChange);
    }

    setIsStandard(newIsStandard) {
        const isStandardChange = new Set(this.fields.ISSTANDARD, newIsStandard);
        super.addChange(isStandardChange);
    }
    
    setIsTransaction(newIsTransaction) {
        const isTransactionChange = new Set(this.fields.ISTRANSACTION, newIsTransaction);
        super.addChange(isTransactionChange);
    }

    setUsedSuggestion(newUsedSuggestion) {
        const usedSuggestionChange = new Set(this.fields.USEDSUGGESTION, newUsedSuggestion);
        super.addChange(usedSuggestionChange);
    }

    // ================= Add Operations ================= //

    // ================= Remove Operations ================= //
}