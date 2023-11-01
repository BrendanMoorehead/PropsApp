import { View, Text, FlatList } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import {useEffect, useState} from 'react';
import { FIRESTORE_DB } from '../config/firebaseConfig';
import { collection, doc, getDoc } from 'firebase/firestore';
import { retrieveSingleMarket } from '../service/dataService';
import { getPlayerName, formatMarketKey } from '../service/parsingService';
const Swiping = () => {

  const gameId = '220a6e10ace10dc524b24c01195b9ebd';

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playerNames, setPlayerNames] = useState([]);
  const [marketKey, setMarketKey] = useState('');

  useEffect(() => {
    if (data.outcomes && data.outcomes.length > 0) {
      const names = data.outcomes.map((outcome) => {
        try {
          return getPlayerName(outcome);
        } catch (error) {
          console.error("Error getting player name:", error.message);
          return null; // or some placeholder value
        }
      });
      setPlayerNames(names);
    }
    
    const fetchData = async () => {
      try{
        const marketData = await retrieveSingleMarket(gameId);
        setData(marketData);
        console.log(data);
        //setMarketKey(formatMarketKey(data.market_key));
      }catch (error){
        console.error("Error getting document", error);
      }
    };
    fetchData();
    
  }, [gameId]);

  return (
    <SafeAreaView>
      <Text>Swiping</Text>
      {data ? (
      <View>
      <Text>{marketKey}</Text>
        {
          playerNames.map((name, index) => (
            name && <Text key={index}>{name}</Text>
          ))}
      </View>
      ) : (
        
      <Text>Loading...</Text>
    )}
    </SafeAreaView>
  )
}

export default Swiping