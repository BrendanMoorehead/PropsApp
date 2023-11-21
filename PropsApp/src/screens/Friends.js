import { View, Text, TextInput,StyleSheet, ActivityIndicator, FlatList, Button } from 'react-native'
import React, {createContext, useContext} from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getAllUsernames } from '../service/dataService'
import { useState, useEffect } from 'react'
import filter from "lodash.filter";
import { indexOf } from 'lodash'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { NavigationContainer } from '@react-navigation/native'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import FriendList from './FriendList'
import FriendSearch from './FriendSearch'
import FriendRequests from './FriendRequests'
import { FriendsProvider } from '../providers/FriendsProvider'




const Friends = ({route}) => {
  const {user} = route.params;

  const contextValue = {

  }

  const Tab = createMaterialTopTabNavigator();


  return (
    <SafeAreaView style={{flex:1}}>
      <FriendsProvider>
        <Tab.Navigator>
          <Tab.Screen name="Friend List" component={FriendList}/>
          <Tab.Screen name="Add Friends" component={FriendSearch} initialParams={{user:user}}/>
          <Tab.Screen name="Requests" component={FriendRequests}/>
        </Tab.Navigator>
        </FriendsProvider>
    </SafeAreaView>
  )
}
const styles = StyleSheet.create({
  searchBox:{
    paddingHorizontal:20, 
    paddingVertical:20, 
    borderColor:'#ccc',
    borderWidth:1, 
    borderRadius:8
  },
  itemContainer:{
    flexDirection:'row', 
    alignItems: 'center',
    marginTop:10,
    justifyContent:"space-between",
    borderRadius:8,
    borderWidth: 1,
    borderColor: '#ccc',
    padding:20
  },
  textName:{
    fontSize:17,
    marginLeft:10,
    fontWeight:'600'
  }
});

export default Friends