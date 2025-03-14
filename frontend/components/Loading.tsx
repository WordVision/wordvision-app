import { StyleSheet, View, Text, ActivityIndicator } from "react-native";
import { ThemedText } from "./ThemedText";

export default function Loading(props: { message: string }) {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007BFF" />
      <ThemedText>{props.message}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
