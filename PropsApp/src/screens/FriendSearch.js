import { View, Text, TextInput,StyleSheet, ActivityIndicator, FlatList, Button } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getAllUsernames } from '../service/dataService'
import { useState, useEffect } from 'react'
import filter from "lodash.filter";
import { indexOf } from 'lodash'
import AsyncStorage from '@react-native-async-storage/async-storage'


const FriendSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [fullData, setFullData] = useState([]);
  const [activeUser, setActiveUser] = useState('');

  useEffect(() => {
    setIsLoading(true);
    currUser = getCurrUser();
    setActiveUser(currUser);
    fetchData();
    setIsLoading(false);
  }, []);

  const handleSearch = (query) => {
    setSearchQuery(query);
    const formattedQuery = query.toLowerCase();
    const filteredData = filter(fullData, (user) => {
      return contains(user, formattedQuery);
    });
    setData(filteredData);
  }

  const contains = (user, query) => {
    const id = user.id.toLowerCase();
    if (user.uid === activeUser){
      return false;
    }
    if (id.includes(query)){
      return true;
    }else{
      return false;
    }
  }

  const getCurrUser = async () => {
    return await AsyncStorage.getItem('UserUID', uid);
  }

  const fetchData = async() => {
    try{
      usernameRef = await getAllUsernames();
      setFullData(usernameRef);
      console.log(fullData);
    }catch(error){
      setError(error);
      console.log(error);
    }
  }

  if(isLoading){
    return (
      <SafeAreaView style={{flex:1, justifyContent:'center', alignItems:"center"}}>
      <ActivityIndicator size="large" color="black"/>
      </SafeAreaView>
    )
  }

  if (error){
    return (
      <SafeAreaView style={{flex:1, justifyContent:'center', alignItems:"center"}}>
      <Text>Error fetching data... Please check your internet connection.</Text>
      </SafeAreaView>
    )
  }

  return (
    <View style={{flex:1, marginHorizontal: 20, marginVertical: 20}}>
      <TextInput 
      placeholder="Search" 
      clearButtonMode='always' 
      style={styles.searchBox}
      autoCapitalize={false}
      autoCorrect={false}
      value={searchQuery}
      onChangeText={((query) => handleSearch(query))}
      />

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({item}) => (
          <View style={styles.itemContainer}>
            <Text style={styles.textName}>{item.id}</Text>
            <Button title="Add Friend"/>
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

export default FriendSearch