import { Image, StyleSheet, View, Text, } from "react-native";
import { useEffect } from "react";
import { Link, Redirect, useNavigation } from "expo-router";

import { useAuth } from "@/utilities/authProvider";

export default function LandingPage() {

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const { session } = useAuth();
  console.log(session);

  if (session) {
    return <Redirect href="/library" />
  }
  else {
    return (
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logo} />
          <Text style={styles.logoTitle}>WordVision</Text>
          <Text style={styles.logoSubtitle}>Where stories come to life</Text>
        </View>

        <View style={styles.buttonGroup}>
          <Link style={[styles.signup, styles.button]} href="/signin">Sign in</Link>
          <Link style={[styles.signin, styles.button]} href="/signup">Create a new account</Link>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#005675",
    padding: 32,

  },

  logoContainer: {
    flex: 1,
    display: "flex",
    width: "100%",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },

  logo: {
    height: 100,
    width: 138,
    marginBottom: 12,
  },

  logoTitle: {
    fontFamily: "Quando_400Regular",
    color: "white",
    fontSize: 40
  },

  logoSubtitle: {
    fontFamily: "AtkinsonHyperlegible_400Regular",
    color: "white",
    fontSize: 16
  },

  buttonGroup: {
    width: "100%",
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },

  signup: {
    backgroundColor: "white",
  },

  signin: {
    backgroundColor: "#80D4FF",
  },

  button: {
    fontFamily: "AtkinsonHyperlegible_400Regular",
    textAlign: "center",
    color: "black",
    fontSize: 16,
    width: "100%",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderRadius: 2
  },

});
