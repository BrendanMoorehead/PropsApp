import { SafeAreaView, Text, StyleSheet, TextInput, Button } from 'react-native'
import { useState } from 'react';
import React from 'react';
import {doc, setDoc, getDoc, runTransaction} from "firebase/firestore";
import { FIRESTORE_DB } from '../config/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
const Username = () => {

    const [username, setUsername] = useState("");

    const addUsernameToUser = async () => {
        const uid = await AsyncStorage.getItem('UserUID');

        if (!uid) console.error("User ID not found in Async Storage.");
        if (!username.trim()) console.error("Username is empty.");

        const usernamesRef = doc(FIRESTORE_DB, 'usernames', username);
        const userRef = doc(FIRESTORE_DB, 'users', uid);

        try {
            await runTransaction(FIRESTORE_DB, async (transaction) => {
                const usernameDoc = await transaction.get(usernamesRef);
                if (usernameDoc.exists()){
                    throw new Error("Username already taken.");
                }
                transaction.set(usernamesRef, {uid});
                transaction.update(userRef, {username});
            });
            console.log("Username added successfully.");
        }catch(error){
            console.error("Error adding username:", error);
            alert(error.message);
        }
        
    }

  return (
    <SafeAreaView
        style={styles.container}
    >
      <Text>Pick a Username:</Text>
      <TextInput
        style={styles.input}
        onChangeText={text => setUsername(text)}
        placeholder="Email"
        autoCapitalize="none"
      ></TextInput>
        <Button
      title='Complete'
      onPress={addUsernameToUser}
      />
    </SafeAreaView>
  )
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    input: {
      width: '80%',
      padding: 20,
      margin: 10,
      borderWidth: 2,
      borderColor: 'black',
      borderRadius: 10,
    }
  });
export default Username