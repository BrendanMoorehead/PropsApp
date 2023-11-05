import { View, Text, TextInput,StyleSheet, ActivityIndicator, FlatList } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getAllUsernames } from '../service/dataService'
import FriendSearch from '../components/FriendSearch'
import { useState, useEffect } from 'react'
import filter from "lodash.filter";
import { indexOf } from 'lodash'

const Friends = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [fullData, setFullData] = useState([]);

  useEffect(() => {
    setIsLoading(true);
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
    if (id.includes(query)){
      return true;
    }else{
      return false;
    }
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
    <SafeAreaView style={{flex:1, marginHorizontal:20}}>
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
          </View>
        )}
      ></FlatList>
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
    marginLeft:10,
    marginTop:10,
  },
  textName:{
    fontSize:17,
    marginLeft:10,
    fontWeight:'600'
  }
});

export default Friends