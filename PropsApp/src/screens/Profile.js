import { View, Text, Button } from 'react-native'
import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { FIREBASE_AUTH } from '../config/firebaseConfig'
import { SafeAreaView } from 'react-native-safe-area-context'
import { signOut, getAuth } from 'firebase/auth'

const Profile = () => {
  const user = FIREBASE_AUTH.currentUser;
  const auth = getAuth();
  const logout = async () => {
    try {
      await signOut(auth);
      console.log("User successfully logged out.");
    }catch(error){
      console.error("Error signing out: ", error);
    }
  }
  return (
    <SafeAreaView>
      <Text>Profile</Text>
      <Text>{user.uid}</Text>
      <Text>{user.email}</Text>
      <Button
        title="Logout"
        onPress={logout}
      />
    </SafeAreaView>
  )
}

export default Profile