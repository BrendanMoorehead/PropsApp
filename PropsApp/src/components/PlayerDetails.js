import { View, Text, StyleSheet } from 'react-native'
import { useEffect, useState } from 'react'
import { getPlayerDetails } from '../service/dataService';
const PlayerDetails = ({player}) => {

    const [name, setName] = useState("temp");
    const [team, setTeam] = useState("temp");
    const [number, setNumber] = useState("temp");
    const [position, setPosition] = useState("temp");

    useEffect(() => {
        getData = async () => {
            const details = await getPlayerDetails(player);
            setName(details[0]);
            setTeam(details[1]);
            setNumber(details[2]);
            setPosition(details[3]);
        }
        getData();
    },[]);

  return (
    <View style={styles.dataWrapper}>
      <View>

        <Text style={styles.playerName}>{name}</Text>
        <View style={styles.teamPosWrapper}>
        <Text style={styles.teamName}>{team}</Text>
        <View style={styles.dot}></View>
        <Text style={styles.position}>{position + " #" + number}</Text>
        </View>
      </View> 
    </View>
  )
}

const styles = StyleSheet.create({
    dataWrapper: {
        flex: 1,
        margin: 20,
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    teamPosWrapper: {
        flexDirection: 'row',
        alignContent: 'center',
        justifyContent: 'center',
       alignItems: 'center', 
       columnGap: 6
    },
    playerName: {
        fontSize: 26,
        color: '#e8e8e8',
        fontWeight: 'bold',
        marginRight: 10
    },
    posWrapper: {
        backgroundColor: '#00e335',
        borderRadius: 8,
        padding: 8,
        justifyContent: 'center'
    },
    position: {
        color: "#bfbfbf",
        fontSize: 14  
    },
    teamName: {
        color: "#bfbfbf"
    },
    number: {
        fontWeight: 'bold',
        fontSize: 42,
        color: '#e8e8e8'
    },
    dot: {
        width: 4, 
        height: 4,
        borderRadius: 50, 
        backgroundColor: "#e8e8e8"
    }
});
export default PlayerDetails