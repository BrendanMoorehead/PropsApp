import { View, Text, TextInput,StyleSheet, ActivityIndicator, FlatList, Button, TouchableOpacity, Modal, Animated } from 'react-native'
import React, { useEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useFriends } from '../providers/FriendsProvider'
import { useState } from 'react'
import Stats from './Stats'
import StatsModal from '../components/StatsModal'
import { MaterialCommunityIcons } from '@expo/vector-icons';

const ModalPopup = ({visible, uid, username, children}) => {
  const [showModal, setShowModal] = useState(visible);
  useEffect(() => {
    toggleModal();
  }, [visible]);

  const toggleModal = () => {
    if (visible){
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }

  return (
  <Modal transparent visible={showModal}>
    <View style={styles.modalBackground}>
    <View style={styles.modalContent}>
     {children}
    </View>
    </View>
  </Modal>);
}

const FriendSearch = ({route}) => {
  const {
    isLoading, 
    handleSearch, 
    handleRequestSend,
    searchQuery,
    searchResults,
    handleRequestAccept} = useFriends();

  const [visible, setVisible] = useState(false);
  const [viewUID, setViewUID] = useState('');
  const [viewUsername, setViewUsername] = useState('');
  
  const handleSend = async (uid, username) => {
    handleRequestSend(uid, username);
  }
  const addBack = async (uid) => {
    handleRequestAccept(uid);
  }

  const handleStatsModal = (uid, username) =>{
    setVisible(true);
    setViewUID(uid);
    setViewUsername(username);
    console.log(username);
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
      <ModalPopup visible={visible} uid={viewUID} username={viewUsername}>

          <View style={styles.header}> 
          <Text style={styles.username}>{viewUsername}</Text>
          <TouchableOpacity onPress={() => setVisible(false)}>
              <MaterialCommunityIcons name="close" size={36} color="#e8e8e8" />
          </TouchableOpacity>
          </View>
        <StatsModal uid={viewUID} />
      </ModalPopup>
      <FlatList
        data={searchResults}
        keyExtractor={(item) => item.id}
        renderItem={({item}) => (
          <TouchableOpacity onPress={() =>handleStatsModal(item.data.uid, item.id)}>
          <View style={styles.itemContainer}>
            <Text style={styles.textName}>{item.id}</Text>
            <Button title="Add Friend" onPress={() => handleSend(item.data.uid, item.id)}/>
          </View>
          </TouchableOpacity>
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
  },
  modalBackground: {
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  modalContent: {
    width: '90%',
    height: "30%",
    borderRadius: 8,
    backgroundColor: '#1a1a1a'
  },
  username: {
    fontWeight: 'bold',
    color: '#e8e8e8',
    fontSize: 24
  },
  header: {
    flex: 1,
     flexDirection: 'row',
     justifyContent: 'space-between',
     padding: 30
  }
});

export default FriendSearch