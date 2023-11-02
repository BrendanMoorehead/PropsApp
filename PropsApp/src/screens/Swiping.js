import { View, Text, FlatList, Button } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import {useEffect, useState} from 'react';
import { FIRESTORE_DB } from '../config/firebaseConfig';
import { collection, doc, getDoc } from 'firebase/firestore';
import { retrieveSingleMarket, getPropProfilesByGameID } from '../service/dataService';
import { getPlayerName, formatMarketKey, getHandicap } from '../service/parsingService';
const Swiping = () => {

  const [document, setDocument] = useState(null);
  const [docArray, setDocArray] = useState(null);

  const gameId = '37fa37022f2a0aead9d7eae6ed8fdf73';

  useEffect(() => {
    getData = async () => {
      const data = await getPropProfilesByGameID(gameId);
      setDocArray(data);
    }
    getData();
  },[]);

  const handlePress = async () => {
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