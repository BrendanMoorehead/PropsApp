//When user is logged in
import { View, Text } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
//Screens import
import FriendsScreen from '../screens/Friends'
import LeaderboardScreen from '../screens/Leaderboard'
import ProfileScreen from '../screens/Profile'
import StatsScreen from '../screens/Stats'
import SwipingScreen from '../screens/Swiping'


const Tab = createBottomTabNavigator();

const userStack = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Leaderboard" component={LeaderboardScreen}/>
        <Tab.Screen name="Friends" component={FriendsScreen}/>
        <Tab.Screen name="Swiping" component={SwipingScreen}/>
        <Tab.Screen name="Stats" component={StatsScreen}/>
        <Tab.Screen name="Profile" component={ProfileScreen}/>
      </Tab.Navigator>
    </NavigationContainer>
  )
}

export default userStack