import { View, Text, StyleSheet, Image, Dimensions, Button, TouchableOpacity } from 'react-native'
import React from 'react'
import {LinearGradient} from 'expo-linear-gradient'

const {width, height} = Dimensions.get('screen');
const Card = ({name, prop, line, image}) => {

    const handleOver = () => {

    }
    const handleUnder = () => {

    }
  return (
    <View style={styles.container}>
        <Image source={image} style={styles.image}/>
        <View
        style={styles.userContainer}
        >
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.prop}>{prop}</Text>
        </View>
        <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.underButton} onPress={handleUnder}>
            <Text style={[styles.btnText, styles.header]}>Under</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.overButton} onPress={handleOver}>
            <Text style={[styles.btnText, styles.header]}>Over</Text>
            </TouchableOpacity>
        </View>
    </View>
  )
}
const styles = StyleSheet.create({

    container: {
        backgroundColor: "#e8e8e8",
        width: width * 0.80,
        height: height * 0.60,
        padding: 20,
        borderRadius: 8,
        backgroundColor: '#121212',
        //Shadows
        shadowColor: '#000000',
        shadowOffset: {width:0 , height:5},
        shadowOpacity: 0.6,
        shadowRadius: 3
    },
    userContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },  
    name: {
        color: '#e8e8e8',
        fontWeight: 'bold',
        fontSize: 36
    },
    prop: {
        color: '#e8e8e8',
        fontSize: 32
    },
    ouWrapper: {
    flexDirection: 'row',
    gap: 30
  },
  overButton: {
    marginTop: 20,
    backgroundColor: "#49d66f",
    padding: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },    
  underButton: {
    marginTop: 20,
    backgroundColor: "#d66565",
    padding: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
      fontSize: 20,
      fontWeight: 'bold'
  }
});
export default Card