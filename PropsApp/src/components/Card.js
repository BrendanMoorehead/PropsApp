import { View, Text, StyleSheet, Image, Dimensions } from 'react-native'
import React from 'react'
import {LinearGradient} from 'expo-linear-gradient'

const {width, height} = Dimensions.get('screen');
const Card = ({name, prop, line, image}) => {
  return (
    <View style={styles.container}>
        <Image source={image} style={styles.image}/>
        <LinearGradient
            colors={['transparent', 'rgba(0,0,0,.9)']}
            style={styles.gradient}
        >
        <View
        style={styles.userContainer}
        >
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.prop}>{prop}</Text>
            <Text style={styles.line}>{line}</Text>
        </View>
        </LinearGradient>
    </View>
  )
}
const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top:25
    },
    image: {
        width: width * 0.9,
        height: height * 0.78,
        borderRadius: 20
    },
    gradient: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 300
    },
    userContainer: {

    },
    name: {

    },
    prop: {

    },
    line: {

    }
});
export default Card