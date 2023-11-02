import { Text, ActivityIndicator, Button, StyleSheet, TextInput } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native';
import { useState } from 'react';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

import AsyncStorage from '@react-native-async-storage/async-storage';
const auth = getAuth();

const SignIn = ({ navigation }) => {
  const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const signIn = async () => {
        try{
            const userCred = await signInWithEmailAndPassword(auth, email, password);     
            const uid = userCred.user.uid;
            await AsyncStorage.setItem('UserUID', uid);
            console.log(uid);
        }catch(err){
            console.log(err);
            alert("Unknown Error: " + err);
        }
    }

  return (
    <SafeAreaView
      style={styles.container}
    >
      <Text>Sign In</Text>
      <TextInput
        style={styles.input}
        onChangeText={text => setEmail(text)}
        value={email}
        placeholder="Email"
        autoCapitalize="none"
      ></TextInput>
      <TextInput
        style={styles.input}
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

export default SignIn