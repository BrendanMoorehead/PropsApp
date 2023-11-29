import { View, Text, SafeAreaView, FlatList, ActivityIndicator, StyleSheet, Button } from 'react-native'
import {useState, useEffect} from 'react'
import React from 'react'
import { getFriendRequests, acceptFriendRequest, rejectFriendRequest } from '../service/friendService'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useFriends } from '../providers/FriendsProvider'
import Divider from '../components/Divider'
import Header from '../components/Header'

const FriendRequests = () => {
  
  const {
    isLoading, 
    requests,
    handleRequestAccept,
    handleRequestReject,
    handleRequestCancel
    } = useFriends();
  

  const handleAccept = async (senderUID, senderUsername) => {
    handleRequestAccept(senderUID, senderUsername);
  }
  const handleReject = async (senderUID, senderUsername) => {
    handleRequestReject(senderUID, senderUsername);
  }
  const handleCancel = async (recieverUID) => {
    handleRequestCancel(recieverUID);
  }

  const preprocessData = (requests) => {
    const incomingRequests = requests.filter(item => item.data.direction === 'incoming');
    const outgoingRequests = requests.filter(item => item.data.direction === 'outgoing');
    const dataWithHeaders = [];

    if (incomingRequests.length > 0) {
      dataWithHeaders.push({ isHeader: true, title: 'Incoming' });
      dataWithHeaders.push(...incomingRequests);
    }
  
    if (outgoingRequests.length > 0) {
      dataWithHeaders.push({ isHeader: true, title: 'Outgoing' });
      dataWithHeaders.push(...outgoingRequests);
    }
  
    return dataWithHeaders;
  };


  

  const sortedData = preprocessData(requests);

  if(isLoading){
    return (
      <SafeAreaView style={{flex:1, justifyContent:'center', alignItems:"center"}}>
      <ActivityIndicator size="large" color="black"/>
      </SafeAreaView>
    )
  }

  if (requests.length == 0){
    return (
      <SafeAreaView style={{flex:1, justifyContent:'center', alignItems:"center"}}>
        <Text>No requests found. Send one on the Add Friends Tab!</Text>
      </SafeAreaView>
    )
  }
  const renderItem = ({item}) => {

    if (item.isHeader) {
      return <Header title={item.title} />;
    }
      return (<View style={styles.itemContainer}>
      <Text style={styles.textName}>{item.data.username}</Text>
      {item.data.direction === 'incoming' ? (
        <>
          <Button title="Accept" onPress={() => handleAccept(item.id, item.data.username)}/>
          <Button title="Reject" onPress={() => handleReject(item.id, item.data.username)}/>
        </>
      ) : (
        <>
          <Button title="Cancel" onPress={() => handleCancel(item.id)}/>
        </>
      )}
      
      </View>);

  }

  return (
    <View style={{flex:1, marginHorizontal: 20, marginVertical: 20}}>
     <FlatList
        data={sortedData}
        keyExtractor={(item, index) => item.isDivider ? 'divider_' + index : item.id}
          renderItem={renderItem}
      />
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

export default FriendRequests