import { View, Text, ActivityIndicator, Button, Alert, StyleSheet, TouchableOpacity, Pressable } from 'react-native'
import React from 'react'
import { SafeAreaView, withSafeAreaInsets } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { TextInput } from 'react-native-gesture-handler';
import { doc, setDoc, runTransaction} from "firebase/firestore";
import { FIRESTORE_DB, FIREBASE_AUTH } from '../config/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signUpWithEmail } from '../auth/auth';

const SignUp = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [username, setUsername] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const signUp = async () => {
        if (password !== confirmPassword){
          Alert.alert("Error", "Passwords do not match.");
          return;
        }
        setIsLoading(true);
        try{
            const uid = await signUpWithEmail(email, password, username);
            await addUsernameToUser(uid);
        }catch(err){
            console.log(err);
            alert("Unknown Error: " + err);
        }finally{
            setIsLoading(false);
        }
    }

    const addUsernameToUser = async (uid) => {

      const usernamesRef = doc(FIRESTORE_DB, 'usernames', username);
      const userRef = doc(FIRESTORE_DB, 'users', uid);

      try {
          await runTransaction(FIRESTORE_DB, async (transaction) => {
              const usernameDoc = await transaction.get(usernamesRef);
              if (usernameDoc.exists()){
                  throw new Error("Username already taken.");
              }
              transaction.set(usernamesRef, {uid});
              transaction.set(userRef, {username}, {merge: true});
          });
          console.log("Username added successfully.");
          setUsername(uid);
      }catch(error){
          console.error("Error adding username:", error);
          alert(error.message);
      } 
  }
    if (isLoading){
        return (
            <SafeAreaView>
                <ActivityIndicator size='large' color='#0000ff'/>
            </SafeAreaView>         
        )
    }
  return (
    <SafeAreaView style={styles.container}>
      <Text style={[styles.text, styles.header]}>Sign Up</Text>
      <TextInput
        style={styles.textBox}
        onChangeText={text => setUsername(text)}
        value={username}
        placeholder="Username"
        autoCapitalize="none"
      ></TextInput>
      <TextInput
        style={styles.textBox}
        onChangeText={text => setEmail(text)}
        value={email}
        placeholder="Email"
        autoCapitalize="none"
      ></TextInput>
      <TextInput
        style={styles.textBox}
        onChangeText={text => setPassword(text)}
        value={password}
        placeholder="Password"
        secureTextEntry={true}
        autoCapitalize="none"
      ></TextInput>
      <TextInput
        style={styles.textBox}
        onChangeText={text => setConfirmPassword(text)}
        value={confirmPassword}
        placeholder="Confirm Password"
        secureTextEntry={true}
        autoCapitalize="none"
      ></TextInput>
      <TouchableOpacity
      style={[styles.button]}
      onPress={signUp}
      >
      <Text style={styles.text}>Sign Up</Text>  
      </TouchableOpacity>
      
      <View>
        <Pressable onPress={() => navigation.navigate('Sign In')}>
          <Text style={styles.text}>Already have an account? Sign in <Text style={styles.blue}>here.</Text></Text>
        </Pressable>
      </View>

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a'
  },
  text: {
    color: '#e8e8e8',
    fontSize: 18
  },
  header:{
    fontWeight: 'bold',
    marginTop: 20
  },
  textBox:{
    width: '80%',
    padding: 20,
    margin: 10,
    borderWidth: 2,
    borderRadius: 10,
    backgroundColor: 'white'
  },
  button:{
    width: '80%',
    padding: 20,
    margin: 10,
    borderWidth: 2,
    borderRadius: 10,
    backgroundColor: '#4a92ff',
    alignItems: 'center',
  },
  blue:{
    color: '#4a92ff',
  }
});

export default SignUp