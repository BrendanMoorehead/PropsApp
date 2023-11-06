import {useState, useEffect } from 'react';
import { FIRESTORE_DB } from '../config/firebaseConfig';
const useFriendManager = (uid) => {
    const [friends, setFriends] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);

    const getFriends = async () => {
        const friendsRef = collection(FIRESTORE_DB, 'users', uid, 'friends');
        const q = query(friendsRef);
        const querySnapshot = await getDocs(q);

        const documents = [];

        querySnapshot.forEach(doc =>{
            documents.push({id: doc.id, data: doc.data()});
        });
        setFriends(documents);
    }
}