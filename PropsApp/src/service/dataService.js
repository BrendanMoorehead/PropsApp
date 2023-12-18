import { FIRESTORE_DB } from "../config/firebaseConfig";
import { doc, getDoc, query, where, collection, getDocs, orderBy } from 'firebase/firestore';

/**
 * Retrives the data for a single market.
 * 
 * This fuction takes a game id and returns the first market for that game.
 * If the game id is not found or the data retrieval fails, the function will throw an error.
 * 
 * @param {string} gameID The ID of the game to retrieve the data for.
 * @returns {Object|null} The data for the first market found.
 * @throws {Error} If the game ID is invalid or data retrieval fails.
 */
export const retrieveSingleMarket = async (gameID) => {
    if (typeof gameID !== 'string' || gameID.trim() === ''){
        throw new Error("Invalid or nonexistent game ID provided.");
    }
    try{
        const docRef = doc(FIRESTORE_DB, 'playerProps', gameID);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) throw new Error("Document not found for gameID: " + gameID);

        const data = docSnap.data();

        if (!Array.isArray(data.sportsbooks) || data.sportsbooks.length === 0) { 
            throw new Error("No sportsbooks found for gameID: " + gameID);
        }
        return removeDuplicateOutcomes(data.sportsbooks[0].market) || null;
    } catch (e){
        throw new Error ("Failed to retrieve document for gameID: " + gameID);
    }
}

/**
 * Removes duplicate outcomes from a market based on the description.
 * 
 * @param {*} market A market object.
 * @returns {market} A new market object with unique outcomes.
 * @throws error if the market object doesn't exist or the outcomes is not an array.
 */
export const removeDuplicateOutcomes = (market) => {
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


export const getPropProfilesByGameID = async (gameID) => {
    if (typeof gameID !== 'string' || gameID.trim() === ''){
        throw new Error("Invalid or nonexistent game ID provided.");
    }
    try{
        const collRef = collection(FIRESTORE_DB, 'futurePlayerPropProfiles');
        const q = query(collRef, where("gameId", '==', gameID));
        const querySnapshot = await getDocs(q);

        const documents = [];

        querySnapshot.forEach(doc =>{
            documents.push({id: doc.id, data: doc.data()});
        });
        return documents;
    } catch (e) {
        throw new Error("Failed to retrieve prop profiles");
    }
}

export const getAllFuturePropProfiles = async () => {
    try{
        const collRef = collection(FIRESTORE_DB, 'futurePlayerPropProfiles');
        const q = query(collRef);
        const querySnapshot = await getDocs(q);

        const documents = [];

        querySnapshot.forEach(doc =>{
            documents.push({id: doc.id, data: doc.data()});
        });
        return documents;
    } catch (e) {
        throw new Error("Failed to retrieve prop profiles");
    }
}
export const getDailyPicks = async (uid) => {
    try{
        const collRef = collection(FIRESTORE_DB, 'users', uid, 'dailyPicks');
        const q = query(collRef);
        const querySnapshot = await getDocs(q);

        const documents = [];

        querySnapshot.forEach(doc =>{
            documents.push({id: doc.id, data: doc.data()});
        });
        return documents;
    } catch (error){
        throw new Error("Failed to get daily user picks: " + error);
    }
}

export const getUserStats = async (uid) => {
    try {
        const userRef = doc(FIRESTORE_DB, 'users', uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()){
            const wins = userDoc.data().wins;
            const losses = userDoc.data().losses;
            const streak = userDoc.data().streak;
            return [wins, losses, streak];
        } else {
            throw new Error("No user found with user ID: " + uid);
        }

    } catch (error) {
        throw new Error ("Failed to get user stats: " + error);
    }
}

export const getPlayerDetails = async (playerId) => {
    try {
        const playersCollectionRef = collection(FIRESTORE_DB, 'nflPlayers');
        const q = query(playersCollectionRef, where("player.id", "==", playerId));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty){
            const playerDoc = querySnapshot.docs[0]; // Assuming there's only one matching document
            const data = playerDoc.data();
            const name = data.player.name;
            const team = data.player.team.nameCode;
            const number = data.player.shirtNumber;
            const position = data.player.position;
            return [name, team, number, position];
        } else {
            throw new Error("No user found with user ID: " + playerId);
        }

    } catch (error) {
        throw new Error ("Failed to get user stats: " + error);
    }
}
export const getPendingPicks = async (uid) => {
    try {
        const picksRef = collection(FIRESTORE_DB, 'users', uid, 'activePicks');
        const q = query(picksRef, orderBy('pickMade', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const documents = [];
        querySnapshot.forEach(doc =>{
            documents.push({id: doc.id, data: doc.data()});
        });
        return documents;

    } catch (error) {
        throw new Error ("Failed to get user stats: " + error);
    }
}
export const getResolvedPicks = async (uid) => {
    try {
        const picksRef = collection(FIRESTORE_DB, 'users', uid, 'completePicks');
        const q = query(picksRef, orderBy('pickMade', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const documents = [];
        querySnapshot.forEach(doc =>{
            documents.push({id: doc.id, data: doc.data()});
        });
        return documents;

    } catch (error) {
        throw new Error ("Failed to get user stats: " + error);
    }
}

export const getAllUsernames = async () => {
    try{
        const collRef = collection(FIRESTORE_DB, 'usernames');
        const q = query(collRef);
        const querySnapshot = await getDocs(q);

        const documents = [];

        querySnapshot.forEach(doc =>{
            documents.push({id: doc.id, data: doc.data()});
        });
        return documents;
    }catch (e) {
        throw new Error("Failed to get usernames.");
    }
}

export const getUsernameFromUID = async (uid) => {
    console.log(uid);
    try{
        const docRef = doc(FIRESTORE_DB, 'users', uid);
        const userDoc = await getDoc(docRef);

        if (userDoc.exists()){
            const username = userDoc.data().username;
            return username;
        }else{
            throw new Error("No user found with user ID: " + uid);
        }
    }catch(e){
        console.log("Failed to get username from UID.");
    }
}