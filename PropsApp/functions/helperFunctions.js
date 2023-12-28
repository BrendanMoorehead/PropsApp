
 const admin = require('firebase-admin');
 const functions = require('firebase-functions');
 const axios = require('axios');

/**
 * Checks if a given date string is in the future.
 * 
 * @param {*} dateString the date to be checked against the current date.
 * @returns True if the date is in the future, false otherwise.
 */
//TODO: Move to a more general helper functions file.
 const isFuture = (dateString) => {
    const inputDate = new Date(dateString);
    const currentDate = new Date();
    return inputDate > currentDate;
}

/**
 * Takes the ID of a document from the composite collection NFLGames and returns the state of the game.
 * 
 * @param {*} gameID an id of a NFLGames doc.
 * @return {string} 'complete', 'future', or 'live' depending on the game's state.
 */
 const checkGameState = async (gameID) => {
    if (typeof gameID !== 'string' || gameID.trim() === ''){
        throw new Error("Invalid or nonexistent game ID provided.");
    }
    try{
        const matchedGameSnapshot = admin.firestore().collection('NFLGames').doc(gameID);
        gameDoc = await matchedGameSnapshot.get();
        const game = gameDoc.data();

        if (isFuture(game.start_timestamp)) return "future";
        else if (checkIfGameIsLive(gameID)) return "live"; 
        else return "complete";
    }catch(e){
        throw new Error("Game document not found: " + e);
    }
}

/**
 * Checks if a given game is live or not.
 * 
 * @param {*} gameID A game ID from the NFLGames collection.
 * @returns true if the game is live, false otherwise.
 */
const checkIfGameIsLive = async (gameID) => {
    const liveGames = await getLiveGames();
    if (liveGames.length > 0){
        for (game in liveGames) if (game.id == gameID) return true;
    }
    else return false;
}

/**
 * Gets the live NFL games from the NFL API.
 * 
 * @returns {array} The currently live NFL games.
 */
const getLiveGames = async () => {
    const options = {
        method: 'GET',
        url: `https://americanfootballapi.p.rapidapi.com/api/american-football/matches/live`,
        headers: {
        'X-RapidAPI-Key': functions.config().nfl_api.api_key,
        'X-RapidAPI-Host': 'americanfootballapi.p.rapidapi.com'
    }};
    const response = await axios.get(`https://americanfootballapi.p.rapidapi.com/api/american-football/matches/live`, 
    { headers: options.headers });
    const liveGames = response.data; 
    return liveGames;
}

/**
 * Delays for the specified amount of time.
 * @param {*} ms The amount of milliseconds to delay.
 * @returns A promise that resolves after the delay has elapsed.
 */
// TODO: Move to a more general helper function file.
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
            if (game) return game.start_timestamp;
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
// TODO: Move to a more general helper function file.
const convertDateFormat = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
}


const getLineName = (line) => {
    if (!line) return ''; // Check if the string is empty or undefined
    const words = line.trim().split(' '); // Split the string into an array of words
    return words[words.length - 1];
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

/**
 * Gets the O/U handicap for a given outcome.
 * @param {*} outcomeObj An outcome object from a playerProps document.
 * @returns The handicap (O/U number for prop).
 */
 function getHandicap(outcomeObj) {
    if (typeof outcomeObj !== 'object' || outcomeObj === null){
        throw new Error("Object is wrong type or undefined.");
    }
    // Get the outcome handicap.
    const handicap = outcomeObj.handicap;
    if (handicap === null || handicap.length === 0) throw new Error("No outcome description.");
    return handicap;
}

/**
 * Gets the player's name for a given outcome.
 * 
 * NOTE: Name extraction is based on the FanDuel markets.
 * 
 * @param {*} outcomeObj An outcome object from a playerProps document.
 * @returns The name of the player for the given outcome.
 */
function getPlayerName(outcomeObj){
    if (typeof outcomeObj !== 'object' || outcomeObj === null){
        throw new Error("Object is wrong type or undefined.");
    }
    // Get the outcome description.
    const desc = outcomeObj.description;
    if (desc === null || desc.length === 0) throw new Error("No outcome description.");

    // Extract the player name from the outcome description.
    const playerName = desc.split(' -')[0];
    console.log(outcomeObj);
    if (playerName === null || playerName.length === 0) throw new Error("Player name extraction failed.");

    return playerName;
}
/**
 * Removes underscores from a market key to make it more readable.
 * 
 * @param {*} marketKey An underscore delimted string describing the prop market.
 * @returns The formatted market key.
 */
async function formatMarketKey(marketKey) {
    if (typeof marketKey !== 'string' || marketKey === null){
        throw new Error("Market key is not a string or undefined.");
    }
    //Removes underscores and capitalizes the first letter of each word.
    return marketKey.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}

/**
 * Gets a market for a given game.
 * 
 * @param {*} gameID A game ID from the Odds API.
 * @returns A document of the market for a given game.
 */
const retrieveSingleMarket = async (gameID, bookie) => {
    if (typeof gameID !== 'string' || gameID.trim() === ''){
        throw new Error("Invalid or nonexistent game ID provided.");
    }
    
    try{
        const docRef = admin.firestore().collection('oddsData').doc(gameID);
        const docSnap = await docRef.get();

        if (!docSnap.exists) throw new Error("Document not found for gameID: " + gameID);

        const data = docSnap.data();

        if (!Array.isArray(data.sportsbooks) || data.sportsbooks.length === 0) { 
            throw new Error("No sportsbooks found for gameID: " + gameID);
        }
        if (data.sportsbooks[0].bookie_key != bookie) throw new Error("Invalid bookie.");
        return removeDuplicateOutcomes(removeZeroHandicaps(data.sportsbooks[0].market)) || null;
    } catch (e){
        throw new Error ("Failed to retrieve document for gameID: " + gameID + e);
    }
}

/**
 * Removes duplicate outcomes from a given market.
 * 
 * @param {*} market An object representing a Odds API market.
 * @returns A market object without the duplicate outcomes.
 */
const removeDuplicateOutcomes = (market) => {
    if (!market || !Array.isArray(market.outcomes)){
        throw new Error("Invalid market object.");
    }
    const uniqueOutcomes = [];
    const descriptions = new Set();
    for (const outcome of market.outcomes){
        if (!descriptions.has(outcome.description)){
            descriptions.add(outcome.description);
            uniqueOutcomes.push(outcome);
        }
    }
    return {...market, outcomes: uniqueOutcomes};
}

/**
 * Removes outcomes with a 0 handicap (O/U line).
 * This is needed as alternate betting lines (higher or lower) are sometimes included in the market object.
 * 
 * @param {*} market An object representing a Odds API market.
 * @returns A market object without zero handicap outcomes.
 */
const removeZeroHandicaps = (market) => {
    if (!market || !Array.isArray(market.outcomes)){
        throw new Error("Invalid market object.");
    }
    const nonZeroHandicaps = [];
    const handicaps = new Set();
    for (const outcome of market.outcomes){
        if (Number(outcome.handicap) !== 0){
            handicaps.add(outcome.handicap);
            nonZeroHandicaps.push(outcome);
        }
    }
    return {...market, handicaps: nonZeroHandicaps};
}

/**
 * Finds the player document given the player's name.
 * @param {*} playerName A space separated name on an existing NFL roster.
 * @returns The player's document or null if the player is not found.
 */
 const findPlayerByName = async (playerName) => {
    const playersRef = admin.firestore().collection('nflPlayers');
    const snapshot = await playersRef.get();

    let foundPlayer = null;

    snapshot.forEach(doc => {
        const player = doc.data();
        if (player.player && player.player.name == playerName){
            foundPlayer = {id: doc.id, data: doc.data()};
        }
    });
    return foundPlayer;
}

//Needs to move the prop over
//Needs to error check if the response is null (maybe only runs if game has passed)
const checkPropHit = async (propProfileDocId, batch) => {
    const docRef = admin.firestore().collection('pastPlayerPropProfiles').doc(propProfileDocId);
    const ref = await docRef.get();
    const prop = ref.data();
    const playerID = prop.playerId;
    const gameID = prop.nflApiGameId;
    const line = prop.handicap;
    const market = prop.marketKey;

    const options = {
        method: 'GET',
        url: `https://americanfootballapi.p.rapidapi.com/api/american-football/match/${gameID}/player/${playerID}/statistics`,
        headers: {
        'X-RapidAPI-Key': functions.config().nfl_api.api_key,
        'X-RapidAPI-Host': 'americanfootballapi.p.rapidapi.com'
    }};
    try {
    const response = await axios.get(`https://americanfootballapi.p.rapidapi.com/api/american-football/match/${gameID}/player/${playerID}/statistics`, 
    { headers: options.headers });
    //For receptions
    if (response && response.data) {
        if (market == 'player_receptions_over_under'){;
            const receptions = response.data.statistics.receivingReceptions;
            if (receptions){
                let outcome = receptions > line ? "over" : "under";

                const completePropsRef = admin.firestore().collection('completePlayerPropProfiles');
                const newDocRef = completePropsRef.doc(propProfileDocId);
                batch.set(newDocRef, {
                    ...prop,
                    outcome: outcome,
                    receptions: receptions
                });
                batch.delete(docRef);
            }
        }
        //Add additional markets
    }
    } catch(error){
        throw new Error ("Failed to upate: " + error);
    }

}
/**
 * Checks a user's prop against the completed props database.
 * @param userID The ID of the user who's prop is to be checked.
 * @param propID The ID of the prop to be checked.
 * @param userPickId The id of the pick in the user's activePicks collection.
 * @returns {boolean} True if won, false if lost.
 */
//TODO: Add additional markets (Currently only receptions)
const checkUserProp = async (userID, propID, userPickId) => {
    let won;
    try{
        //Retrieve the active pick data
        const docRef = admin.firestore().collection('users').doc(userID).collection("activePicks").doc(userPickId);
        const ref = await docRef.get();
        const prop = ref.data();
        const pick = prop.pick;
        //Retrieve the associated prop data
        const completedPropRef = admin.firestore().collection('completePlayerPropProfiles').doc(propID);
        const completeRef = await completedPropRef.get();
        const completedProp = completeRef.data();

        const outcome = completedProp.outcome;
        const receptions = completedProp.receptions;

        (outcome == pick) ? won = true : won = false;

        //Move the active to completed picks
        const completedUserPropRef = admin.firestore().collection('users').doc(userID).collection("completePicks");
        const docName = `${prop.propId}`;
        await completedUserPropRef.doc(docName).set({
            ...prop,
            won: won,
            outcome: outcome,
            receptions: receptions
        });
        //Delete the active pick document
        await docRef.delete();
        return won;
    }catch(e){
        throw new Error("Failed to check user prop: " + propID + " Error: " + e);
    }
}

/**
 * Updates a given user's record and streak in the DB.
 * @param uid The ID of the user who's stats are to be updated.
 * @param addWins The number of wins to be added to the user's record.
 * @param addLosses The number of losses to be added to the user's record.
 */
const bulkUpdateRecord = async (uid, addWins, addLosses) => {
    try{
        //Get user document data
        const docRef = admin.firestore().collection('users').doc(uid);
        const ref = await docRef.get();
        const user = ref.data();

        let currWins = user.wins;
        let currLosses = user.losses;
        let currStreak = user.streak;

        //Update wins, losses, streak
        currWins = currWins + addWins;
        currLosses = currLosses + addLosses;
        currStreak = currStreak + currLosses;

        await docRef.update({
            wins: currWins,
            losses: currLosses,
            streak: currStreak,
        });
    } catch (e){
        throw new Error("Failed to update user: "+ uid +" record/stats in DB: " + e);
    }
}


/**
 * Retrieves a random set of player props from the future profiles collection.
 * 
 * @param {*} uid The ID of the user for which the picks are generated.
 * @returns {array} an array of randomly determined picks.
 */
// TODO: Consider extracting the limit constant as it may be changed for different users.
const determinePlayerPicks = async (uid) => {
    let picks = [];
    const limit = 3; //The number of profiles to be returned
    try{
        const profiles = await admin.firestore().collection("futurePlayerPropProfiles").get();
        const currDailyPicks = await admin.firestore().collection("users").doc(uid).collection("dailyPicks").get();

        if (!profiles.empty){
            //Convert documents to an array
            let docs = profiles.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            let currPicksDocs = currDailyPicks.docs.map(doc => ({id: doc.id, ...doc.data()}));
            //Filter out existing props in the docs
            let filteredDocs = docs.filter(element => !currPicksDocs.includes(element));
            //Reduce the limit to the arrays length
            if (limit > filteredDocs.length) limit = filteredDocs.length;
            //Randomly reorganize the array and take elements until the limit is reached
            picks = shuffleArray(docs).slice(0,limit);
        }
    } catch (e){
        throw new Error("Failed to retrieve picks from DB: " + e);
    }
    return picks;
}
/**
 * Randomly reorganizes the order of an array.
 * 
 * @param {array} array
 * @returns {array} the same array with a random reorganization of it's elements.
 */
// TODO: Move to a general helper function file.
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
}

module.exports = {
    isFuture, 
    checkGameState, 
    delay, 
    getTimestampByGameID, 
    convertDateFormat, 
    getNextThursday, 
    getNextSunday, 
    getNextMonday,
    getHandicap,
    getPlayerName,
    formatMarketKey,
    retrieveSingleMarket,
    removeDuplicateOutcomes,
    removeZeroHandicaps,
    findPlayerByName, 
    checkPropHit,
    checkUserProp,
    getLineName,
    determinePlayerPicks,
    bulkUpdateRecord
}