import { View, Text, Button, StyleSheet, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { useEffect, useState } from 'react'
import { FIREBASE_AUTH } from '../config/firebaseConfig'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProfilePicture from '../components/ProfilePicture'
import { logoutUser } from '../auth/auth'

const Profile = () => {
  const [username, setUsername] = useState('');

  useEffect(() =>{
    const getUsername = async () => {
      try {
        const storedUsername = await AsyncStorage.getItem("Username");
        if (storedUsername !== null){
          setUsername(storedUsername);
        }
      }
      catch (error){
        console.error("Unable to get username: ",error);
      }
    }
    getUsername();
  },[]);

  const logout = async () => {
    try {   
      await logoutUser();
    }catch(error){
      console.error("Error logging out: " + error);
    }
  }
  return (
    <SafeAreaView
      style={styles.container}
    >
      <Text
        style={[styles.text, styles.header]}
      >Profile</Text>
      <ProfilePicture/>
      <Text
        style={styles.text}
      >{username}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity >
          <View style={styles.button}>
            <Text style={styles.text}>Settings</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={logout}>
          <View style={styles.button}>
            <Text style={styles.text}>Logout</Text>
          </View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#1a1a1a'
  },
  buttonContainer: {
    width: '90%',
    marginTop: 20,
  },
  button: {
    marginTop: 20,
    backgroundColor: "#333333",
    paddingVertical: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    color: '#e8e8e8',
    fontSize: 18
  },
  header:{
    fontWeight: 'bold',
    marginTop: 20
  }
});


export default Profile