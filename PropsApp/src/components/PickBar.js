import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import ResultCircle from './ResultCircle';

const PickBar = ({data}) => {

    const formatMarket = () => {
        const pick = data.pick.charAt(0).toUpperCase() + data.pick.slice(1);
        return pick + " " + data.handicap + " " + data.line;
    }

  return (
    <View style={styles.container}>
        <View style={styles.textWrapper}>
            <Text style={styles.playerName}>{data.playerName}</Text>
            <Text style={styles.line}>{formatMarket()}</Text>
        </View>
        <ResultCircle/>
    </View>
  )
}
const styles = StyleSheet.create({
    container: {
        flex:1,
        width: '100%',
        marginBottom: 20,
        padding: 20,
        backgroundColor: '#121212',
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        //Shadows
        shadowColor: '#000000',
        shadowOffset: {width:0 , height:5},
        shadowOpacity: 0.6,
        shadowRadius: 3
    },
    textWrapper: {
        justifyContent: 'center'
    },
    playerName : {
        fontWeight: 'bold',
        fontSize: 18,
        color: '#e8e8e8',
    },
    line : {
        fontSize: 14,
        color: '#e8e8e8',
    }
  });
export default PickBar