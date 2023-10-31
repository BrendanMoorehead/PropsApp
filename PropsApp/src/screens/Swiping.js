import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import {useEffect, useState} from 'react';
const Swiping = () => {
  const [games, setGames] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGames = async () => {
    try {
      const response = await fetch('https://api.prop-odds.com/beta/games/nfl?date={today')
    } catch(error) {

    }
  }

  return (
    <SafeAreaView>
      <Text>Swiping</Text>
    </SafeAreaView>
  )
}

export default Swiping