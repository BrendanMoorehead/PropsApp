import { StyleSheet, View } from "react-native";

const Divider = () => (
    <View style={styles.divider} />
  );
  
  const styles = StyleSheet.create({
    divider: {
      height: 1,
      backgroundColor: '#c9c9c9',
      marginVertical: 10,
      borderRadius: 100
    },
  });
  export default Divider