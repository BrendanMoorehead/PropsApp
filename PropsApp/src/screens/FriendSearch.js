import { View, Text, TextInput,StyleSheet, ActivityIndicator, FlatList, Button } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFriends } from '../providers/FriendsProvider'

const FriendSearch = ({route}) => {
  const {
    isLoading, 
    handleSearch, 
    handleRequestSend,
    searchQuery,
    searchResults} = useFriends();

  const handleSend = async (uid, username) => {
    handleRequestSend(uid, username);
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
      <TextInput 
      placeholder="Search" 
      clearButtonMode='always' 
      style={styles.searchBox}
      autoCapitalize="none"
      autoCorrect={false}
      value={searchQuery}
      onChangeText={((query) => handleSearch(query))}
      />

      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id}
        renderItem={({item}) => (
          <View style={styles.itemContainer}>
            <Text style={styles.textName}>{item.id}</Text>
            <Button title="Add Friend" onPress={() => handleSend(item.data.uid, item.id)}/>
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