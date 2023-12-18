import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
const Leaderboard = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Whoops, looks like we haven't built this yet. Check back soon!</Text>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    color: '#e8e8e8',
    fontSize: 20,
    fontWeight: 'bold',
    width: "60%",
    textAlign: 'center'
  }
});

export default Leaderboard