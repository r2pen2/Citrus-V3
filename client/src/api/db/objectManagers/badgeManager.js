import { ObjectManager } from "./objectManager";
import { DBManager, Set } from "../dbManager";

/**
 * Object Manager for badges
 */
export class BadgeManager extends ObjectManager {
    constructor(_id) {
        super(DBManager.objectTypes.BADGE, _id);
    }

    fields = {
        TITLE: "title",
        DESCRIPTION: "description",
        EMOJI: "emoji",
    }

    getEmptyData() {
        const empty = {
            title: null,            // {string} Badge title 
            description: null,      // {string} Badge description 
            emoji: null,            // {Emoji} Emoji representation of badge 
        }
        return empty;
    }

    handleAdd(change, data) {
        switch (change.field) {
            case this.fields.TITLE:
            case this.fields.DESCRIPTION:
            case this.fields.EMOJI:
                super.logInvalidChangeType(change);
                return data;
            default:
                super.logInvalidChangeField(change);
                return data;
        }
    }

    handleRemove(change, data) {
        switch (change.field) {
            case this.fields.TITLE:
            case this.fields.DESCRIPTION:
            case this.fields.EMOJI:
                super.logInvalidChangeType(change);
                return data;
            default:
                super.logInvalidChangeField(change);
                return data;
        }
    }

    handleSet(change, data) {
        switch (change.field) {
            case this.fields.TITLE:
                data.title = change.value;
                return data;
            case this.fields.DESCRIPTION:
                data.description = change.value;
                return data;
            case this.fields.EMOJI:
                data.emoji = change.value;
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
                case this.fields.TITLE:
                    resolve(this.data.title);
                    break;
                case this.fields.DESCRIPTION:
                    resolve(this.data.description);
                    break;
                case this.fields.EMOJI:
                    resolve(this.data.emoji);
                    break;
                default:
                    super.logInvalidGetField(field);
                    resolve(null);
                    break;
            }
        })
    }

    // ================= Get Operations ================= //
    async getTitle() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.TITLE).then((val) => {
                resolve(val);
            })
        })
    }

    async getDescription() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.DESCRIPTION).then((val) => {
                resolve(val);
            })
        })
    }

    async getEmoji() {
        return new Promise(async (resolve, reject) => {
            this.handleGet(this.fields.EMOJI).then((val) => {
                resolve(val);
            })
        })
    }

    // ================= Set Operations ================= //
    setTilte(newTitle) {
        const titleChange = new Set(this.fields.TITLE, newTitle);
        super.addChange(titleChange);
    }

    setDescription(newDescription) {
        const descriptionChange = new Set(this.fields.DESCRIPTION, newDescription);
        super.addChange(descriptionChange);
    }
    
    setEmoji(newEmoji) {
        const emojiChange = new Set(this.fields.EMOJI, newEmoji);
        super.addChange(emojiChange);
    }

    // ================= Add Operations ================= //

    // ================= Remove Operations ================= //
}