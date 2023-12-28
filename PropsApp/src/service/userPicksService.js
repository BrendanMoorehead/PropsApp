/**
 * User Picks Service
 * ------------------
 * Contains all functions related to an individual user's picks.
 * Retrieving pick collections and other user specific pick-related functions.
 */

import { FIRESTORE_DB } from "../config/firebaseConfig";
import { doc, getDoc, query, collection, getDocs, orderBy } from 'firebase/firestore';

/**
 * Counts the number of active picks for a given user.
 * 
 * @param {*} uid The user ID for which picks are being counted.
 * @returns The count of documents in the user's dailyPicks collection.
 */
// TODO: Check if there is a more efficient way to count docs in a collection.
 export const sumUserActivePicks = async (uid) => {
    const countRef = collection(FIRESTORE_DB, 'users', uid, 'dailyPicks');
    const doc = await getDocs(countRef);
    return doc.size;
}

/**
 * Gets a specific user's statistics, such as wins, losses, and streak.
 * 
 * @param {*} uid The user ID for which stats are being retrieved.
 * @returns The relevant statistics for the user.
 */
 export const getUserStats = async (uid) => {
    try {
        const userRef = doc(FIRESTORE_DB, 'users', uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()){
            const userData = userDoc.data();
            return [userData.wins, userData.losses, userData.streak];
        } else {
            throw new Error("No user found with user ID: " + uid);
        }
    } catch (error) {
        throw new Error ("Failed to get user stats: " + error);
    }
}

/**
 * Gets a given user's pending picks.
 * 
 * @param {*} uid The user ID for which pending picks are being retrieved.
 * @returns {array} The documents in the user's activePicks collection.
 */
 export const getUsersPendingPicks = async (uid) => {
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

/**
 * Gets the resolved picks for a given user.
 * 
 * @param {*} uid The user ID for which resolved picks are being retrieved.
 * @returns {array} The documents in the user's completePicks collection.
 */
 export const getUsersResolvedPicks = async (uid) => {
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

/**
 * Gets the daily picks for a given user.
 * 
 * @param {*} uid The user ID for which given picks are being retrieved.
 * @returns {array} The documents in the user's dailyPicks collection.
 */
export const getUsersDailyPicks = async (uid) => {
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