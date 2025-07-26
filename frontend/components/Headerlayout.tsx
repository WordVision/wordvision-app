import React, { ReactNode } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  useFonts,
  PlayfairDisplay_700Bold_Italic,
} from "@expo-google-fonts/playfair-display";

interface HeaderProps {
  text: string;
  children: ReactNode;
}

export default function HeaderLayout({ text, children }: HeaderProps) {
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_700Bold_Italic,
  });

  if (!fontsLoaded) return null;

  return (
    <View style={styles.headerContainer}>
      <Text style={styles.headerText}>{text}</Text>
      <View>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    zIndex: 50,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  headerText: {
    fontSize: 45,
    fontFamily: "PlayfairDisplay_700Bold_Italic",
    color: "#2C3131",
  },
});
