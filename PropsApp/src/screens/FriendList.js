import { View, Text, SafeAreaView, FlatList, ActivityIndicator, StyleSheet, Button } from 'react-native'
import {useState, useEffect} from 'react'
import React from 'react'
import { getFriendList, acceptFriendRequest, removeFriend } from '../service/friendService'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFriends } from '../providers/FriendsProvider'


const FriendList = () => {
   
  const {
    isLoading, 
    handleRemove,
    friendsList,
  } = useFriends();

  const handleRemoveFriend = async (uid) => {
    handleRemove(uid);
  }
    
    if(isLoading){
      return (
        <SafeAreaView style={{flex:1, justifyContent:'center', alignItems:"center"}}>
        <ActivityIndicator size="large" color="black"/>
        </SafeAreaView>
      )
    }
    return (
      <View style={{flex:1, marginHorizontal: 20, marginVertical: 20}}>
       <FlatList
          data={friendsList}
          keyExtractor={(item) => item.id}
          renderItem={({item}) => (
            <View style={styles.itemContainer}>
              <Text style={styles.textName}>{item.data.friendUsername}</Text>
              <Button title="Remove" onPress={() => handleRemoveFriend(activeUID)}/>
            </View>
          )}
        ></FlatList>
      </View>
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

export default FriendList