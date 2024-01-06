import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import ResultCircle from './ResultCircle';
import { useState } from 'react';


const PickBar = ({data, color}) => {

    const [expanded, setExpanded] = useState(false);

    const toggleExpand = () => {setExpanded(!expanded);}

    const formatMarket = () => {
        const pick = data.pick.charAt(0).toUpperCase() + data.pick.slice(1);
        return pick + " " + data.handicap + " " + data.line;
    }

  return (
    <TouchableOpacity onPress={toggleExpand}>

    {/* Overall Container */}
    <View style={styles.container}> 
        {/* Basic Data Container */}
       <View style={styles.basicInfo}>
            <View style={styles.textWrapper}>
                <Text style={styles.playerName}>{data.playerName}</Text>
                <Text style={styles.line}>{formatMarket()}</Text>
            </View>
            <ResultCircle color={color}/>
       </View>
       {/* Extended Data Container */}
        {expanded &&
        <View style={styles.extendedInfo}>

            <Text style={styles.line}> {'Actual ' + data.line + ": " + data.receptions}</Text>
        </View>
        }
    </View>
    </TouchableOpacity>
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
    },
    basicInfo: {
        flex:1,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    extendedInfo: {
        height: 70
    }
  });
export default PickBar