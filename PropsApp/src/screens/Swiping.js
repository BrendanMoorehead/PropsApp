import { View, StyleSheet, TouchableOpacity, Modal } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import {useEffect, useState} from 'react';
import Card from '../components/Card';
import {getAllFuturePropProfiles, getDailyPicks } from '../service/dataService';
import PlayerDetails from '../components/PlayerDetails';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { usePickBadgeValue } from '../contexts/PickBadgeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

const Swiping = () => {
  const {setPickBadgeValue} = usePickBadgeValue();

  const [document, setDocument] = useState(null);
  const [docArray, setDocArray] = useState([]);
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    getData = async () => {
      const uid = await AsyncStorage.getItem("userToken");
      const data = await getDailyPicks(uid);
      setCards(data);
      setPickBadgeValue(data.length);
    }
    getData();
  },[]);

  const handleCardUnmount = () => {
    setCurrentIndex(prevIndex => prevIndex + 1);
    setPickBadgeValue(cards.length - (currentIndex + 1));
  };

  const currentCard = cards[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      {currentCard &&
       <ModalPopup visible={visible}>

          <View style={styles.header}> 
          <TouchableOpacity onPress={() => setVisible(false)}>
              <MaterialCommunityIcons name="close" size={36} color="#e8e8e8" />
          </TouchableOpacity>
          </View>
          <PlayerDetails player={currentCard.data.playerId} />
        </ModalPopup>}
      {currentCard && (
        <TouchableOpacity onPress={() => setVisible(true)}>
        <Card 
        key={currentIndex}
        document={currentCard}
        name={currentCard.data.playerName} prop={(currentCard.data.handicap + " " + currentCard.data.line)}
        onUnmount={handleCardUnmount}
        />
        </TouchableOpacity>
      )}

    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    marginBottom: 60
  },
  button: {
    margin: 20,
    backgroundColor: "#333333",
    padding: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
    
  },
  playerWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#e8e8e8',
    fontSize: 30
  },
  randomText:{
    color: '#e8e8e8',
    fontSize: 18
  },
  btnText: {
    fontSize: 18
  },
  header:{
    fontWeight: 'bold',
  },
  ouWrapper: {
    flexDirection: 'row',
    gap: 30
  },
  overButton: {
    marginTop: 20,
    backgroundColor: "#49d66f",
    padding: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  underButton: {
    marginTop: 20,
    backgroundColor: "#d66565",
    padding: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
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
})

export default Swiping