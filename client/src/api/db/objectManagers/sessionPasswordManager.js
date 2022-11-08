import { DBManager, Add, Remove, Set } from "../dbManager";
import { ObjectManager } from "./objectManager";

/**
 * Object Manager for groups
 */
export class SessionPasswordManager extends ObjectManager {

    constructor(_id) {
        super(DBManager.objectTypes.SESSIONPASSWORD, _id);
    }

    fields = {
        LOCKED: "locked",
        HISTORY: "history",
        CURRENTSESSION: "currentSession",
    }

    getEmptyData() {
        const empty = {
            locked: false,          // {boolean} whether or not this SessionPassword is currently assigned to an invite
            history: [],            // {array <- SessionPasswordRecord} array of all past uses of this passwordId
            currentSession: null,   // {SessionPasswordRecord} where this SessionPassword points right now
        }
        return empty;
    }

    handleAdd(change, data) {
        switch(change.field) {
            case this.fields.HISTORY:
                data.history.push(change.value);
                return data;
            case this.fields.LOCKED:
            case this.fields.CURRENTSESSION:
                super.logInvalidChangeType(change);
                return data;
            default:
                super.logInvalidChangeField(change);
                return data;
        }
    }

    handleRemove(change, data) {
        switch(change.field) {
            case this.fields.HISTORY:
            case this.fields.LOCKED:
            case this.fields.CURRENTSESSION:
                super.logInvalidChangeType(change);
                return data;
            default:
                super.logInvalidChangeField(change);
                return data;
        }
    }

    handleSet(change, data) {
        switch(change.field) {
            case this.fields.CURRENTSESSION:
                data.currentSession = change.value;
                return data;
            case this.fields.LOCKED:
                data.locked = change.value;
                return data;
            case this.fields.HISTORY:
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
                case this.fields.HISTORY:
                    let historyArray = [];
                    for (const jsonHistory of this.data.history) {
                        historyArray.push(new SessionPasswordRecord(jsonHistory));
                    }
                    resolve(historyArray);
                    break;
                case this.fields.LOCKED:
                    resolve(this.data.locked);
                    break;
                case this.fields.CURRENTSESSION:
                    if (this.data.currentSession) {
                        resolve(new SessionPasswordRecord(this.data.currentSession));
                    } else {
                        resolve(null);
                    }
                    break;
                default:
                    super.logInvalidGetField(field);
                    resolve(null);
                    break;
            }
        })
    }

    // ================= Get Operations ================= //
    async getHistory() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.HISTORY).then((val) => {
                resolve(val);
            })
        })
    }

    async getLocked() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.LOCKED).then((val) => {
                resolve(val);
            })
        })
    }

    async getCurrentSession() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.CURRENTSESSION).then((val) => {
                resolve(val);
            })
        })
    }

    async getTotalUses() {
        return new Promise(async (resolve, reject) => {
            let uses = 0;
            const history = await this.getHistory();
            uses += history.length;
            const currentlyInUse = await this.getLocked();
            if (currentlyInUse) {
                uses++;
            }
            resolve(uses);
        })
    }
    
    // ================= Set Operations ================= //
    setCurrentSession(newCurrentSession) {
        const jsonRecord = newCurrentSession.toJson();
        const currentSessionChange = new Set(this.fields.CURRENTSESSION, jsonRecord);
        super.addChange(currentSessionChange);
        // Also check if this current session is currently active and lock accordingly
        if (!newCurrentSession.isExpired()) {
            this.setLocked(true);
        }
    }
    
    setLocked(newLocked) {
        const lockedChange = new Set(this.fields.LOCKED, newLocked);
        super.addChange(lockedChange);
    }

    // ================= Add Operations ================= //
    addHistory(newSessionPasswordRecord) {
        const jsonRecord = newSessionPasswordRecord.toJson();
        const historyAddition = new Add(this.fields.HISTORY, jsonRecord);
        super.addChange(historyAddition);
    }

    // ================= Remove Operations ================= //
    // ================= Sub-Obejct Operations ================= //
    async retireCurrentSession() {
        return new Promise(async (resolve, reject) => {
            const currentSession = await this.getCurrentSession();
            if (!currentSession) {
                resolve(false)
            } else if (!currentSession.isExpired()) {
                resolve(false);
            } else {
                this.setCurrentSession(null);
                this.addHistory(currentSession);
                this.setLocked(false);
            }
        })
    }

    async checkValid() {
        return new Promise(async (resolve, reject) => {
            const currentSession = await this.getCurrentSession();
            if (!currentSession) {
                resolve(false)
            } else if (currentSession.isExpired()) {
                await this.retireCurrentSession();
                resolve(false);
            } else {
                resolve(true);
            }
        })
    }

    async assignToTarget(targetId, targetType) {
        return new Promise(async (resolve, reject) => {
            const currentSession = await this.getCurrentSession();
            let passwordAvailable = false;
            if (currentSession) {
                if (currentSession.isExpired()) {
                    await this.retireCurrentSession();
                    passwordAvailable = true;
                }
            } else {
                const locked = await this.getLocked();
                if (!locked) {
                    // Should never be locked without a current session, but just in case...
                    passwordAvailable = true;
                }
            }
            if (!passwordAvailable) {
                // Password is currently locked, so we can't reassign it
                resolve(false);
            } else {
                // Password is available— create a new SessionPasswordRecord and set it as current session
                const newSession = new SessionPasswordRecord();
                newSession.setTarget(targetId);
                newSession.setTargetType(targetType);
                this.setCurrentSession(newSession);
                resolve(true);
            }
        })
    }
}

class SessionPasswordRecord {
    constructor(_data) {
        this.target = _data ? _data.target : null;
        this.targetType = _data ? _data.targetType : null;
        this.createdAt = _data ? _data.createdAt : new Date();
        this.expiresAt = _data ? _data.expiresAt : (new Date()).setDate((new Date()).getDate() + 1);
        this.usedBy = _data ? _data.usedBy : [];
    }

    setTarget(targetId) {
        this.target = targetId;
    }

    setTargetType(targetType) {
        this.targetType = targetType;
    }

    setCreatedAt(createdAt) {
        this.createdAt = createdAt;
    }

    setExpiresAt(expiresAt) {
        this.expiresAt = expiresAt;
    }

    addUsedBy(userId) {
        this.usedBy = this.usedBy.push({
            usedId: userId,
            timestamp: new Date(),
        });
    }

    toJson() {
        return {
            target: this.target,
            targetType: this.targetType,
            createdAt: this.createdAt,
            expiresAt: this.expiresAt,
            usedBy: this.usedBy,
        }
    }

    isExpired() {
        return new Date().getTime() > this.createdAt.getTime();
    }
}