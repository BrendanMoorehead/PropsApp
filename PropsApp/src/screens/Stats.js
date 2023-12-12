import { View, Text, StyleSheet, ScrollView } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import ProfilePicture from '../components/ProfilePicture'
import PickBar from '../components/PickBar'
import { calculateWinRate } from '../service/statsService'
import {useEffect, useState} from 'react';
const Stats = () => {

  const [winrate, setWinrate] = useState();

  useEffect(() => {
    getData = async () => {
      const uid = await AsyncStorage.getItem("userToken");
      
    }
    getData();
  },[]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
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
            <Text style={styles.bigText}>15-9</Text>
            <Text style={styles.subText}>Record</Text>
          </View>
          <View>
          <Text style={styles.bigText}>62%</Text>
            <Text style={styles.subText}>Winrate</Text>
          </View>
          <View>
          <Text style={styles.bigText}>3</Text>
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
  }
});

export default Stats