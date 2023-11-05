import { FIRESTORE_DB } from "../config/firebaseConfig";
import { doc, getDoc, query, where, collection, getDocs, setDoc, Timestamp } from 'firebase/firestore';

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
        console.log("Friend request failed.");
    }
}
export const acceptFriendRequest = async (currentUid, requestFromUid) => {
    const friendRef = doc(FIRESTORE_DB, 'users', currentUid, 'friends', requestFromUid);
    const inverseFriendRef = doc(FIRESTORE_DB, 'users', requestFromUid, 'friends', currentUid);
    const friendRequestRef = doc(FIRESTORE_DB, 'users', currentUid, 'friendRequests', requestFromUid);

    try{
        await setDoc(friendRef, {
            friendUID: requestFromUid,
            timestamp: Timestamp.fromDate(new Date()),
        })
        await setDoc(inverseFriendRef, {
            friendUID: currentUid,
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
export const rejectFriendRequest = (fromUID, toUID) => {
    
}
export const removeFriend = (uid, friendUID) => {
    
}

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

export const getFriendList = async(uid) => {
    
}