/**
 * Gets a player name from an outcome object.
 * 
 * @param {*} outcomeObj The outcome object from a market.
 * @returns {string} The name of the player.
 * @throws Will throw an error if the input is invalid, if the description is missing, or if the players name fails to be extracted.
 */
export const getPlayerName = (outcomeObj) => {
    if (typeof outcomeObj !== 'object' || outcomeObj === null){
        throw new Error("Object is wrong type or undefined.");
    }
    // Get the outcome description.
    const desc = outcomeObj.description;
    if (desc === null || desc.length === 0) throw new Error("No outcome description.");

    // Extract the player name from the outcome description.
    const playerName = desc.split(' -')[0];
    if (playerName === null || playerName.length === 0) throw new Error("Player name extraction failed.");

    return playerName;
}

/**
 * Takes a market key from the API format and returns a more readable string.
 * 
 * @param {*} marketKey The key for the market retrieved from the database.
 * @returns {string} A more readable version of the key.
 */
export const formatMarketKey = (marketKey) => {
    if (typeof marketKey !== 'string' || marketKey === null){
        throw new Error("Market key is not a string or undefined.");
    }
    //Removes underscores and capitalizes the first letter of each word.
    return marketKey.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Gets the handicap (line) from the outcome object.
 * 
 * @param {*} outcomeObj The outcome object from a market.
 * @returns {string} The handicap line.
 * @throws Will throw an error if the outcome object is invalid or if the handicap is not found.
 */
export const getHandicap = (outcomeObj) => {
    if (typeof outcomeObj !== 'object' || outcomeObj === null){
        throw new Error("Object is wrong type or undefined.");
    }
    // Get the outcome handicap.
    const handicap = outcomeObj.handicap;
    if (handicap === null || handicap.length === 0) throw new Error("No outcome description.");
    return handicap;
}