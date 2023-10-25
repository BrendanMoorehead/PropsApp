import { View, Text, ActivityIndicator, Button } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { TextInput } from 'react-native-gesture-handler';

const auth = getAuth();

const SignUp = ({ navigation }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const signUp = async () => {
        setIsLoading(true);
        try{
            await createUserWithEmailAndPassword(auth, email, password);
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