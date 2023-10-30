import { View, Text, Image, StyleSheet } from 'react-native'
import React from 'react'

const ProfilePicture = () => {
  return (
    <View style={styles.box}>
      <Image/>
    </View>
  )
}

const styles = StyleSheet.create({
    box: {
        width: 150,
        height: 150,
        padding: 30,
        backgroundColor: '#ffc16b',
        margin: 30,
        borderRadius: 10,
    }
})

export default ProfilePicture