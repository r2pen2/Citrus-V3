// All possible emoji id strings
export const emojiIds = {
    BEERMUG: "&#x1F37A",
    CHECKMARK: "&#x2714",
    CLINKINGBEERMUGS: "&#x1F37B",
    COFFEE: "&#x2615",
    COWBOYHATFACE: "&#x1F920",
    MONEYBAG: "&#x1F4B0",
    MONEYWITHWINGS: "&#x1F4B8",
    PEACH: "&#x1F351",
    PIZZA: "&#x1F355",
    SKULL: "&#x1F480",
    ZOMBIE: "&#x1F9DF",
}

export class Emoji {
    constructor(_emojiId) {
        this.hex = _emojiId;
    }
}