import { View, Text, SafeAreaView, FlatList, ActivityIndicator, StyleSheet, Button } from 'react-native'
import {useState, useEffect} from 'react'
import React from 'react'
import { getFriendRequests, acceptFriendRequest } from '../service/friendService'
import AsyncStorage from '@react-native-async-storage/async-storage'

const FriendRequests = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeUID, setActiveUID] = useState('');
  useEffect(() => {
    const fetchRequests = async () => {
      try{
        
        setIsLoading(true);
        const uid = await AsyncStorage.getItem("UserUID");
        const req = await getFriendRequests(uid);
        setActiveUID(uid);
        setRequests(req);
      }catch(err){
        console.error(err.message);
      }finally{setIsLoading(false);}
    }
    fetchRequests();
  }, []);

  const handleAccept = async (currUID, acceptUID) => {
    try{
    setIsLoading(true);
    await acceptFriendRequest(currUID, acceptUID);
    const updatedReq = await getFriendRequests(activeUID);
    setRequests(updatedReq);
    } catch(error){
      console.error("failed to accept friend request." + error);
    }finally{
      setIsLoading(false);
    }
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
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={({item}) => (
          <View style={styles.itemContainer}>
            <Text style={styles.textName}>{item.data.username}</Text>
            <Button title="Accept" onPress={() => handleAccept(activeUID, item.id)}/>
            <Button title="Reject" onPress={() => handlePress(item.data.uid)}/>
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

export default FriendRequests