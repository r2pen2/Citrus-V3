/**
 * Sorts a list by date
 * @param {[Object]} array list to be sorted
 * @returns {[Object]} sorted list
 */
export function sortByDate(array) {
    if (!array) {
        return null;
    }
    array.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    })
    return array;
}

/**
 * Sorts a list by UT date
 * @param {[Object]} array list to be sorted
 * @returns {[Object]} sorted list
 */
 export function sortByUTDate(array) {
    if (!array) {
        return null;
    }
    array.sort((a, b) => {
        return b.date.toDate() - a.date.toDate();
    })
    return array;
}

/**
 * Sorts a list by createdAt
 * @param {[Object]} array list to be sorted
 * @returns {[Object]} sorted list
 */
 export function sortByCreatedAt(array) {
    array.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
    })
    return array;
}

/**
 * Sorts a list by data.createdAt
 * @param {[Object]} array list to be sorted
 * @returns {[Object]} sorted list
 */
 export function sortByDataCreatedAt(array) {
    array.sort((a, b) => {
        return b.data.createdAt.toDate() - a.data.createdAt.toDate();
    })
    return array;
}

/**
 * Sorts a list by displayName
 * @param {[Object]} array list to be sorted
 * @returns {[Object]} sorted list
 */
 export function sortByDisplayName(array) {
    array.sort((a, b) => {
        if (a.displayName < b.displayName) {
            return -1;
        }
        if (a.displayName > b.displayName) {
            return 1;
        }
        return 0;
    });
    return array;
}