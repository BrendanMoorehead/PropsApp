import { StyleSheet, View,Text } from "react-native";

const Header = ({ title }) => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerText}>{title}</Text>
    </View>
  );
  
  const styles = StyleSheet.create({
    headerContainer: {
      // Style your header container
    },
    headerText: {
      // Style your header text
      fontWeight: 'bold',
      fontSize: 16,
      marginTop:10,
    },
    // ... other styles ...
  });

  export default Header