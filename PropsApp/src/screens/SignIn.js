import { Text, ActivityIndicator, Button, StyleSheet, TextInput, TouchableOpacity, View, Pressable } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native';
import { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { signInWithEmail } from '../auth/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setUsername } from '../service/authService';

const SignIn = ({ navigation }) => {
  const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const signIn = async () => {
        try{
            const uid = signInWithEmail(email, password);
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
      <Text style={[styles.text, styles.header]}>Sign In</Text>
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
      <TouchableOpacity
      style={[styles.button]}
      onPress={signIn}
      >
      <Text style={styles.text}>Sign In</Text>  
      </TouchableOpacity>
      <View>
        <Pressable onPress={() => navigation.navigate('Sign Up')}>
          <Text style={styles.text}>Don't have an account? Sign up <Text style={styles.blue}>here.</Text></Text>
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

export default SignIn