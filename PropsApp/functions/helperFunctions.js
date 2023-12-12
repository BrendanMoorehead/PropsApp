
 const admin = require('firebase-admin');
 const functions = require('firebase-functions');
 const axios = require('axios');

/**
 * Checks if a given date string is in the future.
 * 
 * @param {*} dateString the date to be checked against the current date.
 * @returns True if the date is in the future, false otherwise.
 */
 const isFuture = (dateString) => {
    const inputDate = new Date(dateString);
    const currentDate = new Date();
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
    try{
    const matchedGameSnapshot = admin.firestore().collection('NFLGames').doc(gameID);
    gameDoc = await matchedGameSnapshot.get();
    const game = gameDoc.data();
    console.log(game);
    if (isFuture(game.start_timestamp)) return "future";
    else if (checkIfGameIsLive(gameID)) return "live"; 
    return "complete";
    }catch(error){
        throw new Error("Game document not found: " + error);
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
        for (game in liveGames) {
            console.log(game);
            if (game.id == gameID) return true;
        }
    }
    else return false;
}

/**
 * Gets the live NFL games from the NFL API.
 * 
 * @returns an array of the currently live NFL games.
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
    const matchesArr = response.data; 
    return matchesArr;
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

const checkUserProp = async (userID, propID, userPickId) => {
    try{
    const docRef = admin.firestore().collection('users')
    .doc(userID).collection("activePicks").doc(userPickId);
    const propRef = admin.firestore().collection("completePlayerPropProfiles");
    const ref = await docRef.get();
    const prop = ref.data();

    const gameID = prop.nflApiGameId;
    const playerID = prop.playerId; 
    const pick = prop.pick;
    console.log(`Passed: ${userID}, ${propID}, ${userPickId}`);
    const completedPropRef = admin.firestore().collection('completePlayerPropProfiles').doc(propID);
    const completeRef = await completedPropRef.get();
    console.log(completeRef.data());
    const completedProp = completeRef.data();
    const outcome = completedProp.outcome;
    const receptions = completedProp.receptions;

    let won;
    if (outcome == pick){
        won = true;
    }else{
        won = false;
    }

    const completedUserPropRef = admin.firestore().collection('users').doc(userID).collection("completePicks");
    const docName = `${gameID}_${playerID}`;
    await completedUserPropRef.doc(docName).set({
        ...prop,
        won: won,
        outcome: outcome,
        receptions: receptions
    });
    await docRef.delete();

    updateRecord(userID, won);
}
catch(e){
    console.log("helper: " + e);
}
}

const updateRecord = async (userID, won) => {
    try{
    const docRef = admin.firestore().collection('users')
    .doc(userID);
    const ref = await docRef.get();
    const user = ref.data();

    let wins = user.wins;
    let losses = user.losses;
    let streak = user.streak;

    if (won){ 
        wins++;
        streak++;
    }
    else {
        losses++;
        streak = 0;
    }
    
    await docRef.update({
        wins: wins,
        losses: losses,
        streak: streak,
    });
    }
    catch(e){
        console.log("wins" + e);
    }
}

// LEADERBOARD FUNCTIONS
const createScore = async (score, userID) => {
    await admin.firestore().collection("wins").doc().create({
        user: userID,
        score: score
    });
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
    checkUserProp
}