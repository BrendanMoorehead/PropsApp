import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import FriendSearch from '../components/FriendSearch'
const Friends = () => {
  return (
    <SafeAreaView>
      <Text>Friends</Text>
      <FriendSearch/>
    </SafeAreaView>
  )
}

export default Friends