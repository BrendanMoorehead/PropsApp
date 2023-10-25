import { View, Text, Button } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context';
const Welcome = ({ navigation }) => {
  return (
    <SafeAreaView>
      <Text>Welcome</Text>
      <Button 
      title="Sign Up"
      onPress={() => navigation.navigate('Sign Up')}
      />
      <Button 
      title="Sign In"
      onPress={() => navigation.navigate('Sign In')}
      />
    </SafeAreaView>
  )
}

export default Welcome