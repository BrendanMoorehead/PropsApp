import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import ProfilePicture from '../components/ProfilePicture'
import PickBar from '../components/PickBar'

import {useEffect, useState} from 'react';
import { getUserStats } from '../service/dataService';
import AsyncStorage from '@react-native-async-storage/async-storage';
const Stats = () => {

  const [winrate, setWinrate] = useState('');
  const [wins, setWins] = useState(null);
  const [losses, setLosses] = useState(null);
  const [streak, setStreak] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);

    // Place your data fetching logic here
    await getData();

    setRefreshing(false);
  }, []);

  useEffect(() => {
    getData = async () => {
      const uid = await AsyncStorage.getItem("userToken");
      const stats = await getUserStats(uid);
      setWins(stats[0]);
      setLosses(stats[1]);
      setStreak(stats[2]);
    }
    getData();
  },[]);
  useEffect(() => {
    // This effect runs whenever wins or losses change
    if (wins !== null && losses !== null) {
      const calculateWinRate = () => {
        const totalGames = wins + losses;
        const winRate = totalGames > 0 ? Number((wins / totalGames * 100).toFixed(0)) : 0;
        setWinrate(winRate + "%");
        setStatsLoading(false);
      };
  
      calculateWinRate();
    }
  }, [wins, losses]); 

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }>
      <View style={styles.userinfoWrapper}>
        <ProfilePicture/>
        <View style={styles.userinfoTextWrapper}>
          <Text style={styles.username}>Moorehead</Text>
          <Text style={styles.level}>Level 4</Text>
        </View>
      </View>

      <View style={styles.statsWrapper}>
        <Text style={styles.statsHeader}>Stats</Text>
        <View style={styles.statsDetailsWrapper}>
          <View>
            {statsLoading ? <ActivityIndicator size='large'/> : <Text style={styles.bigText}>{wins}-{losses}</Text>}
            <Text style={styles.subText}>Record</Text>
          </View>
          <View>
          {statsLoading ? <ActivityIndicator size='large'/> : <Text style={styles.bigText}>{winrate}</Text>}
            <Text style={styles.subText}>Winrate</Text>
          </View>
          <View>
          {statsLoading ? <ActivityIndicator size='large'/> : <Text style={styles.bigText}>{streak}</Text>}
            <Text style={styles.subText}>Streak</Text>
          </View>
        </View>
      </View>

      <View>
      <Text style={styles.statsHeader}>Recent Picks</Text>
        <View style={styles.pickBarContainer}>
          <PickBar/>
          <PickBar/>
        </View>
      </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  userinfoWrapper: {
    display: 'flex',
    flexDirection: 'row',
  },
  userinfoTextWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 30
  },
  username: {
    fontWeight: 'bold',
    color: '#e8e8e8',
    fontSize: 24
  },
  level: {
    color: '#e8e8e8',
    fontSize: 16
  },
  statsWrapper: {
    
  },
  statsHeader: {
    fontWeight: 'bold',
    color: '#e8e8e8',
    fontSize: 20,
    paddingLeft: 30
  },
  statsDetailsWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 6,
    padding: 8,
    paddingBottom: 50
  },
  bigText: {
    fontWeight: 'bold',
    color: '#e8e8e8',
    fontSize: 38,
  },
  subText: {
    color: '#e8e8e8',
    fontSize: 14,
  },
  pickBarContainer : {
    margin: 30
  },
  
});

export default Stats