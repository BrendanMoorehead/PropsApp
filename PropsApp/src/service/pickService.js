import { FIRESTORE_DB } from "../config/firebaseConfig";
import {doc, collection, setDoc, addDoc, deleteDoc} from 'firebase/firestore'
//Service for users picks

/**
 * Adds a prop pick to the user's account.
 * 
 * @param {*} pick "over" or "under" depending on user input.
 * @param {*} prop The document for the player prop profile presented to the user.
 * @param {*} uid The id of the active user.
 */
export const setPick = async (pick, prop, uid) => {
    const userPicksRef = collection(FIRESTORE_DB, 'users', uid, "activePicks");
    try {
        const currentDate = new Date();
        const newPickRef = doc(userPicksRef, `${prop.data.id}`);
        await setDoc(newPickRef, {
            pick: pick,
            active: true,
            propId: prop.id,
            startTime: prop.data.startTime,
            playerName: prop.data.playerName,
            market: prop.data.marketKey,
            handicap: prop.data.handicap,
            line: prop.data.line,
            pickMade: currentDate,
        });
    } catch (error){
        throw new Error("Pick failed to be made: " + error.message);
    }
}

/**
 * Deletes the document for a given pick from a user's dailyPicks collection.
 * 
 * @param {*} pickID The ID of the dailyPicks document.
 * @param {*} userID The ID of the user that the pick is being deleted from.
 */
// TODO: Add error checking for invalid pickID or userID.
export const deletePick = async(pickID, userID) => {
    try{ 
        const userPickRef = doc(FIRESTORE_DB, 'users', userID, "dailyPicks", pickID);
        await deleteDoc(userPickRef);
    } catch (error){
        throw new Error("Failed to remove pick from user's daily picks collection: " + error);
    }
}