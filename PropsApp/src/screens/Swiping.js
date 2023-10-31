import { View, Text } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import {useEffect, useState} from 'react';
const Swiping = () => {
  const [games, setGames] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  return (
    <SafeAreaView>
      <Text>Swiping</Text>
    </SafeAreaView>
  )
}

export default Swiping