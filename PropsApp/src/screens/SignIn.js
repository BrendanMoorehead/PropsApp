import { View, Text, ActivityIndicator, Button } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { TextInput } from 'react-native-gesture-handler';
import useAuth from '../hooks/useAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
const auth = getAuth();

const SignIn = ({ navigation }) => {
  const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const signIn = async () => {
        setIsLoading(true);
        try{
            const userCred = await signInWithEmailAndPassword(auth, email, password);     
            const uid = userCred.user.uid;
            await AsyncStorage.setItem('UserUID', uid);
            console.log(uid);
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
      <Text>Sign In</Text>
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
      title='Sign In'
      onPress={signIn}
      />

    </SafeAreaView>
  )
}

export default SignIn