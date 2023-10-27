import { View, Text } from 'react-native'
import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { FIREBASE_AUTH } from '../config/firebaseConfig'
import { SafeAreaView } from 'react-native-safe-area-context'

const Profile = () => {
  const user = FIREBASE_AUTH.currentUser;
  return (
    <SafeAreaView>
      <Text>Profile</Text>
      <Text>{user.uid}</Text>
      <Text>{user.email}</Text>
    </SafeAreaView>
  )
}

export default Profile