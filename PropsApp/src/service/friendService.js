import { FIRESTORE_DB } from "../config/firebaseConfig";
import { doc, getDoc, query, where, collection, getDocs, setDoc, Timestamp, deleteDoc } from 'firebase/firestore';
import { getUsernameFromUID } from "./dataService";

/**
 * Sends a friend request from 'fromUID' to 'toUID'.
 * 
 * @param {*} fromUID The user id for the logged in user who is sending the request.
 * @param {*} toUID The user id for the user receiving the request.
 * @param {*} username The username of the user sending the request.
 */
export const sendFriendRequest = async (fromUID, toUID, username) => {
    const friendRequestRef = doc(FIRESTORE_DB, 'users', toUID, 'friendRequests', fromUID);
    try{
        await setDoc(friendRequestRef, {
            from: fromUID,
            username: username,
            timestamp: Timestamp.fromDate(new Date()),
            status: 'pending',
        });
        console.log("Friend request sent.");
    }catch(err){
        throw new Error("Failed to send friend request: "+ err);
    }
}

/**
 * Accepts a friend request and adds both users to eachother's friends list.
 * 
 * @param {*} currentUid The user ID of the active user.
 * @param {*} requestFromUid The user ID of the user who sent the request.
 */
export const acceptFriendRequest = async (currentUid, requestFromUid) => {
    const friendRef = doc(FIRESTORE_DB, 'users', currentUid, 'friends', requestFromUid);
    const inverseFriendRef = doc(FIRESTORE_DB, 'users', requestFromUid, 'friends', currentUid);
    const friendRequestRef = doc(FIRESTORE_DB, 'users', currentUid, 'friendRequests', requestFromUid);

    const myUsername = await getUsernameFromUID(currentUid);
    const thierUsername = await getUsernameFromUID(requestFromUid);

    try{
        await setDoc(friendRef, {
            friendUID: requestFromUid,
            friendUsername: thierUsername,
            timestamp: Timestamp.fromDate(new Date()),
        })
        await setDoc(inverseFriendRef, {
            friendUID: currentUid,
            friendUsername: myUsername,
            timestamp: Timestamp.fromDate(new Date()),
        })
        await setDoc(friendRequestRef, {
            status: 'accepted',
        }, {merge:true});
        console.log("Friend request accepted.");
    }catch(error){
        console.error("Error accepting friend request.");
    }
}

/**
 * Rejects the friend request and removes it from the database.
 * 
 * @param {*} toUID The currently logged in user who received the request.
 * @param {*} fromUID The id of the user who sent the request.
 */
export const rejectFriendRequest = async (toUID, fromUID) => {
    try{
        const friendRequestRef = doc(FIRESTORE_DB, 'users', toUID, 'friendRequests', fromUID);
        await deleteDoc(friendRequestRef);
    } catch(error){
        throw new Error("Failed to delete friend request: " + error);
    }
}
export const removeFriend = async (uid, friendUID) => {
    try{
        const friendRef = doc(FIRESTORE_DB, 'users', uid, 'friends', friendUID);
        const otherUserFriendRef = doc(FIRESTORE_DB, 'users', friendUID, 'friends', uid);
        await deleteDoc(friendRef);
        await deleteDoc(otherUserFriendRef);
    } catch (error){
        throw new Error("Failed to remove friend: " + error);
    }
}

/**
 * Gets a list of requests for the logged in user.
 * 
 * @param {*} uid The id of the user currently logged in.
 * @returns An array of friend request documents.
 */
export const getFriendRequests = async (uid) => {
    try{
    const friendRequestRef = collection(FIRESTORE_DB, 'users', uid, 'friendRequests');
    const q = query(friendRequestRef);
    const querySnapshot = await getDocs(q);

    const documents = [];

    querySnapshot.forEach(doc =>{
        if (doc.data().status === 'pending')
        documents.push({id: doc.id, data: doc.data()});
    });
    return documents;
    }
    catch(e){
        throw new Error("Failed to retrieve friend requests." + e);
    }
}

/**
 * Gets the list of friends for the current user.
 * 
 * @param {*} uid The id of the currently logged in user.
 * @returns An array of friends documents.
 */
export const getFriendList = async(uid) => {
    try{
        const friendsRef = collection(FIRESTORE_DB, 'users', uid, 'friends');
        const q = query(friendsRef);
        const querySnapshot = await getDocs(q);

        const documents = [];

        querySnapshot.forEach(doc =>{
            documents.push({id: doc.id, data: doc.data()});
        });
        return documents;

    }catch(e){
        throw new Error("Failed to get friend list.");
    }
}
