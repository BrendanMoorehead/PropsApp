import { View, Text, FlatList, Button, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import {useEffect, useState} from 'react';
import { setPick } from '../service/pickService';
import Card from '../components/Card';
import { FIRESTORE_DB } from '../config/firebaseConfig';
import { collection, doc, getDoc } from 'firebase/firestore';
import { retrieveSingleMarket, getPropProfilesByGameID, getAllFuturePropProfiles } from '../service/dataService';
import { getPlayerName, formatMarketKey, getHandicap } from '../service/parsingService';
import AsyncStorage from '@react-native-async-storage/async-storage';
const Swiping = () => {

  const [document, setDocument] = useState(null);
  const [docArray, setDocArray] = useState([]);
  const [cards, setCards] = useState([]);
  useEffect(() => {
    getData = async () => {
      const data = await getAllFuturePropProfiles();
      setDocArray(data);
    }
    getData();
  },[]);

  const handlePress = async () => {
    console.log("Random Press");
    const randomDoc = docArray[Math.floor(Math.random() * docArray.length)];
    console.log(randomDoc);
    setDocument(randomDoc);
  }
  const handleOver = async () => {
    const uid = await AsyncStorage.getItem("userToken");
    console.log(uid);
    setPick("over", document, uid);
  }
  const handleUnder = async () => {
    const uid = await AsyncStorage.getItem("userToken");
    console.log(uid);
    setPick("under", document, uid);
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.button}
      onPress={handlePress}
      >
      <Text style={[styles.randomText, styles.header]}>Generate Random Prop</Text>
      </TouchableOpacity>
      {document && (
        <View style={styles.playerWrapper}>     
        <Text style={styles.text}>{document.data.playerName}</Text>
        <Text style={styles.text}>{document.data.market}</Text>
        <Text style={styles.text}>O/U {document.data.handicap}</Text>
        </View>
      )}
      <View style={styles.ouWrapper}>
        <TouchableOpacity style={styles.underButton} onPress={handleUnder}>
          <Text style={[styles.btnText, styles.header]}>Under</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.overButton} onPress={handleOver}>
        <Text style={[styles.btnText, styles.header]}>Over</Text>
        </TouchableOpacity>
      </View>
  
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#1a1a1a'
  },
  button: {
    marginTop: 20,
    backgroundColor: "#333333",
    padding: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  playerWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#e8e8e8',
    fontSize: 30
  },
  randomText:{
    color: '#e8e8e8',
    fontSize: 18
  },
  btnText: {
    fontSize: 18
  },
  header:{
    fontWeight: 'bold',
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
  underButton: {
    marginTop: 20,
    backgroundColor: "#d66565",
    padding: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  }
})

export default Swiping