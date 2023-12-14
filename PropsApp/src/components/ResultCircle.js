import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

const ResultCircle = ({color}) => {
  return (
    <View style={[styles.circle, { backgroundColor: color }]} />
  )
}
const styles = StyleSheet.create({
    circle:{
        borderRadius: 50,
        width: 50,
        height: 50,
    }
});

export default ResultCircle