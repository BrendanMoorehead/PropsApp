import { View, Text, FlatList, Button } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import {useEffect, useState} from 'react';
import { FIRESTORE_DB } from '../config/firebaseConfig';
import { collection, doc, getDoc } from 'firebase/firestore';
import { retrieveSingleMarket, getPropProfilesByGameID, getAllFuturePropProfiles } from '../service/dataService';
import { getPlayerName, formatMarketKey, getHandicap } from '../service/parsingService';
const Swiping = () => {

  const [document, setDocument] = useState(null);
  const [docArray, setDocArray] = useState([]);

  const gameId = 'b2d39147aec696cb353de39f6cd6060d';

  useEffect(() => {
    getData = async () => {
      const data = await getAllFuturePropProfiles();
      setDocArray(data);
    }
    getData();
  },[gameId]);

  const handlePress = async () => {
    console.log("Random Press");
    const randomDoc = docArray[Math.floor(Math.random() * docArray.length)];
    setDocument(randomDoc);
  }

  return (
    <SafeAreaView>
      <Text>Pick a Prop</Text>
      <Button title="Press Me"
      onPress={handlePress}
      />
      {document && (
        <Text>{JSON.stringify(document)}</Text>
      )}
    </SafeAreaView>
  )
}

export default Swiping