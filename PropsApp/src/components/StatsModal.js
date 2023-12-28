
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native'
import React from 'react'
import {useEffect, useState} from 'react';
import { getUserStats } from '../service/userPicksService'


const StatsModal = ({uid}) => {

    const [winrate, setWinrate] = useState('');
    const [wins, setWins] = useState(null);
    const [losses, setLosses] = useState(null);
    const [streak, setStreak] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);

    useEffect(() => {
        getData = async () => {
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
    <View>
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

    </View>
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
      padding: 30
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
    altText: {
      color: '#e8e8e8',
      fontSize: 14,
    },
    pickBarContainer : {
      margin: 30,
    },
  
  });

export default StatsModal