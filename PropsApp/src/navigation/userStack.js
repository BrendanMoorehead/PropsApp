//When user is logged in
import { View, Text, StyleSheet } from 'react-native'
import React, { useEffect } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { BottomTabBar, createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { Badge } from 'react-native-elements';
//Screens import
import FriendsScreen from '../screens/Friends'
import LeaderboardScreen from '../screens/Leaderboard'
import ProfileScreen from '../screens/Profile'
import StatsScreen from '../screens/Stats'
import SwipingScreen from '../screens/Swiping'

import { usePickBadgeValue } from '../contexts/PickBadgeContext'
import { countPicks } from '../service/dataService'
import AsyncStorage from '@react-native-async-storage/async-storage';

const Tab = createBottomTabNavigator();

const userStack = ({user}) => {
  const {pickBadgeValue, setPickBadgeValue} = usePickBadgeValue();

  useEffect(() => {
    getData = async () => {
      const uid = await AsyncStorage.getItem("userToken");
      const pickCount = await countPicks(uid);
      setPickBadgeValue(pickCount);
    }
    getData();
  }, []);

  return (
    <View style={{flex: 1}}>
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Swiping"
        screenOptions={({ route }) => ({
          headerShown: false,
          
          tabBarIcon: ({focused, color, size}) => {
            let iconName;
            if (route.name === 'Leaderboard'){
              iconName = focused ? 'trophy' : 'trophy-outline';
            }
            else if (route.name === 'Friends'){
              iconName = focused ? 'people' : 'people-outline';
            }
            else if (route.name === 'Picks'){
              iconName = focused ? 'swap-horizontal' : 'swap-horizontal-outline';
            }
            else if (route.name === 'Stats'){
              iconName = focused ? 'bar-chart' : 'bar-chart-outline';
            }
            else if (route.name === 'Profile'){
              iconName = focused ? 'person' : 'person-outline';
            }
            return (
              <View style={styles.container}>
            <Ionicons name={iconName} size={size} color={color} style={styles.tabBarIconStyle}/>
            {pickBadgeValue > 0 && route.name === 'Picks' &&
            <Badge status='primary' value={pickBadgeValue} position="absolute" top={-35} left={20}/>
            }
            </View>
            )
          },
          tabBarStyle: {
            backgroundColor: '#121212',
            paddingBottom: 20,
            height: "12%",
            marginTop: 30,
            borderTopWidth: 0,  
            //Shadows
            shadowColor: '#000000',
            shadowOffset: {width:0 , height:-5},
            shadowOpacity: 0.6,
            shadowRadius: 3,
            position: 'absolute'
          },
          tabBarLabelStyle: styles.tabBarLabelStyle
        })}
      >
        <Tab.Screen name="Leaderboard" component={LeaderboardScreen}/>
        <Tab.Screen name="Friends" component={FriendsScreen} initialParams={{user:user}}/>
        <Tab.Screen name="Picks" component={SwipingScreen}/>
        <Tab.Screen name="Stats" component={StatsScreen}/>
        <Tab.Screen name="Profile" component={ProfileScreen}/>
      </Tab.Navigator>
    </NavigationContainer>
    </View>
  )
}
const styles = StyleSheet.create({
  tabBarLabelStyle: {
    marginBottom: 20, // Adjust the bottom margin to reduce space between text and icon
  },
  tabBarIconStyle: {
    marginBottom: 0, // Adjust the bottom margin to move the icon closer to the text
  },

  // ... other styles
});
export default userStack