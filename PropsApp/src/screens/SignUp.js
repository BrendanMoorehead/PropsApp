import { View, Text, ActivityIndicator, Button } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { TextInput } from 'react-native-gesture-handler';
import { doc, setDoc} from "firebase/firestore";
import { FIRESTORE_DB } from '../config/firebaseConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
const auth = getAuth();

const SignUp = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const signUp = async () => {
        setIsLoading(true);
        try{
            const userCred = await createUserWithEmailAndPassword(auth, email, password);
            const uid = userCred.user.uid;
            await AsyncStorage.setItem('UserUID', uid);
            //Add user data to the database
            //Will overwrite existing data if a user is deleted
            await setDoc(doc(FIRESTORE_DB, 'users', uid), {
                email: email,
                uid: uid,
            });
        }catch(err){
            console.log(err);
            alert("Unknown Error: " + err);
        }finally{
            setIsLoading(false);
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
    <SafeAreaView>
      <Text>Sign Up</Text>
      <TextInput
        onChangeText={text => setEmail(text)}
        value={email}
        placeholder="Email"
        autoCapitalize="none"
      ></TextInput>
      <TextInput
        onChangeText={text => setPassword(text)}
        value={password}
        placeholder="Password"
        secureTextEntry={true}
        autoCapitalize="none"
      ></TextInput>
      <Button
      title='Sign Up'
      onPress={signUp}
      />

    </SafeAreaView>
  )
}

export default SignUp