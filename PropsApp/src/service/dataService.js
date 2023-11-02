import { FIRESTORE_DB } from "../config/firebaseConfig";
import { doc, getDoc, query, where, collection, getDocs } from 'firebase/firestore';

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
        const collRef = collection(FIRESTORE_DB, 'playerPropProfiles');
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

