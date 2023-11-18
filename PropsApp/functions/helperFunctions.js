
 const admin = require('firebase-admin');
/**
 * Takes in a game ID and checks if that game is live or not.
 * 
 * @param {*} gameID an NFLOddsAPI game ID.
 */
 const isLive = (gameID) => {
    //Calls GET LiveMatches from the football API and checks against game ids.
    // NEED A LIVE GAME TO COMPLETE
}

/**
 * Checks if a given date string is in the future.
 * 
 * @param {*} dateString the date to be checked against the current date.
 * @returns True if the date is in the future, false otherwise.
 */
 const isFuture = (dateString) => {
    const inputDate = new Date(dateString);
    const currentDate = new Date();
    console.log("Input:" )
    return inputDate > currentDate;
}

/**
 * Takes the ID of a document from the composite collection NFLGames and returns the state of the game.
 * 
 * @param {*} gameID an id of a NFLGames doc.
 */
 const checkGameState = async (gameID) => {
    if (typeof gameID !== 'string' || gameID.trim() === ''){
        throw new Error("Invalid or nonexistent game ID provided.");
    }
    const matchedGameSnapshot = admin.firestore().collection('NFLGames').doc(gameID);
    gameDoc = await matchedGameSnapshot.get();
    const game = gameDoc.data();
    console.log(game);
    if (isFuture(game.start_timestamp)) return "future";
    else if (1) return "live"; //TODO: check live.
    return "complete";
}

/**
 * Delays for the specified amount of time.
 * @param {*} ms The amount of milliseconds to delay.
 * @returns A promise that resolves after the delay has elapsed.
 */
function delay(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Gets the starting timestamp of a game.
 * 
 * @param {*} gameId An Odds API game ID.
 * @returns The starting timestamp of the game or null if the game doesn't exist.
 */
const getTimestampByGameID = async (gameId) => {
    try{
        const futureNflGamesCollection = admin.firestore().collection('futureNflGameDays');
        const snapshot = await futureNflGamesCollection.get();

        for (const doc of snapshot.docs){
            const games = doc.data().games;
            const game = games.find(g => g.game_id === gameId);
            if (game) {
                return game.start_timestamp;
            }
        }
        return null;
        } catch (e) {
        throw new Error ("Failed to load documents for game: " + gameId + "Error: " + e);
    }
}

/**
 * Converts a date separated by dashes (-) into a date separated by slashes (/).
 * 
 * @param {*} dateString A dash separated date string.
 * @returns A slash separated date string.
 */
const convertDateFormat = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
}

/**
 * Gets the date of upcoming Sunday.
 * 
 * @returns the date in YYYY-MM-DD format.
 */
 function getNextSunday(){
    const now = new Date();
    const dayOfWeek = now.getDay();
    // Sunday in number format is 0.
    const daysUntilSunday = (7 - dayOfWeek) % 7;
    const sunday = new Date(now);
    sunday.setDate(now.getDate() + daysUntilSunday);
    return sunday.toISOString().split('T')[0];
}

/**
 * Gets the date of upcoming Monday.
 * 
 * @returns the date in YYYY-MM-DD format.
 */
function getNextMonday(){
    const now = new Date();
    const dayOfWeek = now.getDay();
    // Monday in number format is 1.
    const daysUntilMonday = (1 + 7 - dayOfWeek) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() + daysUntilMonday);
    return monday.toISOString().split('T')[0];
}

/**
 * Gets the date of upcoming Thursday.
 * 
 * @returns the date in YYYY-MM-DD format.
 */
function getNextThursday(){
    const now = new Date();
    const dayOfWeek = now.getDay();
    // Thursday in number format is 4.
    const daysUntilThursday = (4 + 7 - dayOfWeek) % 7;
    const thursday = new Date(now);
    thursday.setDate(now.getDate() + daysUntilThursday);
    return thursday.toISOString().split('T')[0];
}

module.exports = {isLive, isFuture, checkGameState, delay, getTimestampByGameID, convertDateFormat, getNextThursday, getNextSunday, getNextMonday}