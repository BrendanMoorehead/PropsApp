import { FIRESTORE_DB } from "../config/firebaseConfig";
import { doc, getDoc } from 'firebase/firestore';

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
        return data.sportsbooks[0].market || null;
    } catch (e){
        throw new Error ("Failed to retrieve document for gameID: " + gameID);
    }
}

