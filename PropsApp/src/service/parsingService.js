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