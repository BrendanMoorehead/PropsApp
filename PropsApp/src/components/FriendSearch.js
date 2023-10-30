import { View, Text, TextInput, Button, FlatList } from 'react-native'
import React from 'react'
import {useState} from 'react'
import { getFirestore, collection, query, where, getDoc, doc, getCollection } from 'firebase/firestore'
import { FIRESTORE_DB } from '../config/firebaseConfig'

const FriendSearch = () => {
    const [username, setUsername] = useState('');
    const [userDoc, setUserDoc] = useState(null);
    const [error, setError] = useState(null);

    const search = async () => {
        // Figure out to lowercase 
        const usersRef = doc(FIRESTORE_DB, 'usernames', username.toLowerCase());
        try {
            const docSnap = await getDoc(usersRef);
            if (docSnap.exists()){
                setUserDoc(docSnap.data());
                setError(null);
            } else {
                setError('Username not found.');
                setUserDoc(null);
            }
        } catch (error){
            console.error('Error searching for username: ', error);
            setError("Error searching for username.");
            setUserDoc(null);
        }
    };

  return (
    <View>
     <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="Enter Username"
     />
     <Button
        title="Search"
        onPress={search}
     />
     {error && <Text>{error}</Text>}
     {userDoc && (
        <View>
            <Text>Username: {userDoc.uid}</Text>
        </View>
     )}
    </View>
  )
}

export default FriendSearch