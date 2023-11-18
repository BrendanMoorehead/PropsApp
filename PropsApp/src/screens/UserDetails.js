import { View, Text, Button, StyleSheet, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { useEffect, useState } from 'react'
import { FIREBASE_AUTH } from '../config/firebaseConfig'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProfilePicture from '../components/ProfilePicture'
import { logoutUser } from '../auth/auth'


const UserDetails = () => {
    const [username, setUsername] = useState('');
    useEffect(() =>{
        const getUsername = async () => {
          try {
            const storedUsername = await AsyncStorage.getItem("username");
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

  return (
    <SafeAreaView>
      <Text>{username}</Text>
      
    </SafeAreaView>
  )
}

export default UserDetails