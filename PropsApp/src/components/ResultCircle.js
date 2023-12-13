import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

const ResultCircle = () => {
  return (
    <View style={styles.circle}>
    </View>
  )
}
const styles = StyleSheet.create({
    circle:{
        borderRadius: 50,
        width: 50,
        height: 50,
        backgroundColor: '#e8e8e8'
    }
});

export default ResultCircle