import { View, Text, StyleSheet, Image, Dimensions, Button, TouchableOpacity } from 'react-native'
import React from 'react'
import {LinearGradient} from 'expo-linear-gradient'
import { Animated } from 'react-native';
import { useRef } from 'react';
import { useEffect } from 'react';
import { setPick } from '../service/pickService';
import AsyncStorage from '@react-native-async-storage/async-storage';
const {width, height} = Dimensions.get('screen');
const Card = ({name = "blank", prop = "blank", line, image, onUnmount, document}) => {

    const slideAnim = useRef(new Animated.Value(0)).current; // Using useRef for the animated value
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const translateYAnim = useRef(new Animated.Value(height)).current; 

    useEffect(() => {
        // Slide up animation when the component mounts
        Animated.timing(translateYAnim, {
            toValue: 0, // Slide up to position
            duration: 500,
            useNativeDriver: true,
        }).start();
    }, [translateYAnim]);

    slideLeft = async () => {
         await handleUnder();
        Animated.timing(slideAnim, {
            toValue: -width, // Assuming you want to slide out of the screen
            duration: 200, // Duration of the slide
            useNativeDriver: true,
        }).start();
        Animated.timing(rotateAnim, {
            toValue: 1, // Represents 100% of the interpolation
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            if (onUnmount) {
                onUnmount();
            }
        });
    };
    slideRight = async () => {
        await handleOver();
        Animated.timing(slideAnim, {
            toValue: width, // Assuming you want to slide out of the screen
            duration: 200, // Duration of the slide
            useNativeDriver: true,
        }).start();
        Animated.timing(rotateAnim, {
            toValue: -1, // Represents 100% of the interpolation
            duration: 200,
            useNativeDriver: true,
        }).start(() => {
            if (onUnmount) {
                onUnmount();
            }
        });
    };

    const rotation = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '-8deg'] // Rotation from 0 to 8 degrees
    });

    const combinedStyles = [
        styles.container, 
        { 
            transform: [
                { translateY: translateYAnim },
                { translateX: slideAnim },
                { rotate: rotation } // Apply rotation
            ]
        }
    ];



    const handleOver = async () => {
        const uid = await AsyncStorage.getItem("userToken");
        setPick("over", document, uid);
      }
      const handleUnder = async () => {
        const uid = await AsyncStorage.getItem("userToken");
        setPick("under", document, uid);
      }
  return (
    <Animated.View style={combinedStyles}>
        <LinearGradient
                // Gradient colors array
                colors={['#281391', '#5836ff']}
                style={styles.gradient}
            >
        <Image source={image} style={styles.image}/>
        <View
        style={styles.userContainer}
        >
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.prop}>{prop}</Text>
        </View>
        <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.underButton} onPress={slideLeft}>
            <Text style={[styles.btnText, styles.header]}>Under</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.overButton} onPress={slideRight}>
            <Text style={[styles.btnText, styles.header]}>Over</Text>
            </TouchableOpacity>
        </View>
        </LinearGradient>
    </Animated.View>
  )
}
const styles = StyleSheet.create({

    container: {
        backgroundColor: "#e8e8e8",
        width: width * 0.80,
        height: height * 0.60,
        borderRadius: 8,
        backgroundColor: '#121212',
        //Shadows
        shadowColor: '#000000',
        shadowOffset: {width:0 , height:5},
        shadowOpacity: 0.6,
        shadowRadius: 3,
        overflow: 'hidden'
    },
    gradient: {
        flex: 1, // Ensure the gradient fills the entire container
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
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
    marginLeft: 20
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    
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