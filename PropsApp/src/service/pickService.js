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
        await addDoc(userPicksRef, {
            prop: prop,
            pick: pick,
            active: true,
            propId: prop.id
        });
    } catch (error){
        throw new Error("Pick failed to be made: " + error.message);
    }
}

/**
 * Creates a new document in resolvedPicks and verfies whether the pick hit or not.
 * Deletes the active document.
 * 
 * TODO: Add ability to verify pick hit.
 * 
 * @param {*} uid The id of the active user.
 * @param {*} propId The id of the prop document to be verified.
 */
export const verifyPick = async (uid, propId) => {
    const userPickRef = doc(FIRESTORE_DB, 'users', uid, "activePicks", propId);
    if (!userPickRef) throw new Error("Unable to find active pick with id: " + propId);
    const resolvedPicksRef = collection(FIRESTORE_DB, 'users', uid, "resolvedPicks");
    try{
        await addDoc(resolvedPicksRef,{
            prop: userPickRef.data.prop,
            pick: userPickRef.data.prop,
            active: false,
            hit: false,
        });
        await deleteDoc(userPickRef);
    } catch (error){
        throw new Error("Failed to move pick document: " + error);
    }
}

/**
 * Checks if the bet hit or not.
 * 
 * @param {*} line The player's pre-game line.
 * @param {*} stat The player's game stats.
 * @param {*} guess 'over' or 'under', the user's guess.
 * @returns True if the bet hit, false if the bet didn't.
 */
 const checkLineHit = (line, stat, guess) => {
    if (guess != 'over' || guess != 'under') throw new Error("Invalid guess string: " + guess);
    if (guess == "over"){
        if (stat > line) return true;
        return false;
    }
    else {
        if (stat < line) return true;
        return false;
    }
}