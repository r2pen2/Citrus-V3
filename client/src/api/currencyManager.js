/**
 * RouteManager is a tool handling currencies. Contains methods for formatting and converting between different currencies (legal and emoji)
 */
export class CurrencyManager {

    static emojiCurrencies = {
        BEER: "🍺",
        PIZZA: "🍕",
        COFFEE: "☕",
    }

    static legalCurrencies = {
        USD: "USD",
    }

    static getLegalCurrencySymbol(legalCurrency) {

        // Now we know that this is a legal currency
        switch (legalCurrency) {
            case this.legalCurrencies.USD:
                return "$";
            default:
                return "?";
        }
    }

    static formatUSD(num) {
        const formatter = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        })
        return formatter.format(num);
    }

}