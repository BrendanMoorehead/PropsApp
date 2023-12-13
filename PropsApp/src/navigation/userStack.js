//When user is logged in
import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { BottomTabBarHeightCallbackContext, createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Ionicons from 'react-native-vector-icons/Ionicons'
//Screens import
import FriendsScreen from '../screens/Friends'
import LeaderboardScreen from '../screens/Leaderboard'
import ProfileScreen from '../screens/Profile'
import StatsScreen from '../screens/Stats'
import SwipingScreen from '../screens/Swiping'


const Tab = createBottomTabNavigator();

const userStack = ({user}) => {
  return (
    <View style={{flex: 1, backgroundColor: '#1a1a1a'}}>
    <NavigationContainer
      style={styles.nav}
    >
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
            else if (route.name === 'Swiping'){
              iconName = focused ? 'swap-horizontal' : 'swap-horizontal-outline';
            }
            else if (route.name === 'Stats'){
              iconName = focused ? 'bar-chart' : 'bar-chart-outline';
            }
            else if (route.name === 'Profile'){
              iconName = focused ? 'person' : 'person-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />
          },
          tabBarStyle: {
            backgroundColor: '#121212',
            marginLeft: 16,
            marginRight: 16,
            marginBottom: 44,
            borderRadius: 10,
            paddingBottom: 10,
            borderTopWidth: 0,  
            //Shadows
            shadowColor: '#000000',
            shadowOffset: {width:0 , height:5},
            shadowOpacity: 0.8,
            shadowRadius: 3
          }
        })}
      >
        <Tab.Screen name="Leaderboard" component={LeaderboardScreen}/>
        <Tab.Screen name="Friends" component={FriendsScreen} initialParams={{user:user}}/>
        <Tab.Screen name="Swiping" component={SwipingScreen}/>
        <Tab.Screen name="Stats" component={StatsScreen}/>
        <Tab.Screen name="Profile" component={ProfileScreen}/>
      </Tab.Navigator>
    </NavigationContainer>
    </View>
  )
}

const styles = StyleSheet.create({

})

export default userStack