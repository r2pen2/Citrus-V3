/**
 * If transaction is valid, returns a transaction object to be sent to DB
 * @param {String} newTitle title of transaction to be displayed in dashboard
 * @param {Number} transactionTotal total amount of transaction to be split among users
 * @param {Object} initialFronters list of fronter objects
 * @param {Object} initialPayers list of payer objects
 * @returns {Object} transaction object to be sent to DB or null if transaction is invalid
 */
export function createTransaction(newTitle, transactionTotal, initialFronters, initialPayers) {
    // Run checks to make sure that payer and fronter weights add up to 100%
    // We do this with the numeric amount that each user is responsible for to avoid rounding errors
    var payerTotal = 0;
    var fronterTotal = 0;
    for (const payer of initialPayers) {
        payerTotal += (payer.weight * transactionTotal);
    }
    for (const fronter of initialFronters) {
        fronterTotal += (fronter.weight * transactionTotal);
    }
    if (payerTotal !== fronterTotal || fronterTotal !== transactionTotal) {
        return null;
    }
    return {
        active: true,
        createdAt: new Date(),
        fronters: initialFronters,
        payers: initialPayers,
        title: newTitle,
        total: transactionTotal,
    }
}

/**
 * Creates a fronter object to be added to a transaction
 * @param {String} id userId of fronter
 * @param {Number} fronterWeight how much of the total the fronter paid for the
 * @returns {Object} fronter object to be added to a transaction
 */
export function createFronter(id, fronterWeight) {
    return {
        userId: id,
        weight: fronterWeight,
    }
}

/**
 * Creates a payer object to be added to a transaction
 * @param {String} id userId of payer
 * @param {Number} payerWeight how much of the total the payer is responsible for
 * @param {Number} payerCredit how much (in dollars) the payer has already contributed to their debt
 * @returns {Object} payer object to be added to a transaction
 */
 export function createPayer(id, payerWeight, payerCredit) {
    return {
        userId: id,
        weight: payerWeight,
        credi: payerCredit
    }
}

/**
* Returns a list of every payer that isn't the current user
* @param {Object} t current transaction
* @param {String} userId id of user in context
* @returns {Array} all other payers in a transaction
*/
export function getOtherPayers(t, userId) {
    return t.payers.filter(payer => payer.userId !== userId);
}

/**
* Returns a user's debt in a transaction
* @param {Object} t current transaction
* @param {String} userId id of user in context
* @returns {Number} amount of debt associated with user
*/
export function getPayerDebt(t, userId) {
    for (const payer of t.payers) {
        if (payer.userId === userId) {
            return payer.weight * t.total;
        }
    }
}

/**
 * Returns a user's credit in a transaction
 * @param {Object} t current transaction
 * @param {String} userId id of user in context
 * @returns {Number} amount of credit associated with user
 */
export function getPayerCredit(t, userId) {
    for (const payer of t.payers) {
        if (payer.userId === userId) {
            return payer.credit;
        }
    }
}

/**
 * Returns whether or not the user in context is a fronter in a transaction
 * @param {Object} t transaction to query
 * @param {String} userId id of user in context
 * @returns {Boolean} whether or not the user is a payer in the transaction
 */
export function userIsFronter(t, userId) {
    for (const fronter of t.fronters) {
        if (fronter.userId === userId) {
            return true;
        }
    }
    return false;
}

/**
* Returns a user's credit in a transaction
* @param {Object} t current transaction
* @param {String} userId id of user in context
* @returns {Number} amount of debt associated with user
*/
export function getFronterCredit(t, userId) {
    var amountPaid = 0;
    for (const payer of t.payers) {
        amountPaid += payer.credit;
    }
    return (amountPaid)
}

/**
* Returns a user's debt in a transaction
* @param {Object} t current transaction
* @param {String} userId id of user in context
* @returns {Number} amount of debt associated with user
*/
export function getFronterDebt(t, userId) {
    for (const fronter of t.fronters) {
        if (fronter.userId === userId) {
            return fronter.weight * t.total;
        }
    }
}