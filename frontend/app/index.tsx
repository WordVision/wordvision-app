import {
  Image,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Text,
  Pressable,
} from "react-native";
import { useState, useEffect } from "react";
import { Redirect } from "expo-router";

import { Auth, User, getUser } from "@/utilities/authContext";
import Loading from "@/components/Loading";

export default function LandingPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [email, setEmail] = useState<string>("");

  useEffect(() => {
    async function init() {
      const user = await getUser();
      setUser(user);
      setLoading(false);

      if (!user) {
        console.info("No user was found");
        return;
      }

      // Log the user info for debugging purposes
      console.log({ user }, "User Info");
    }

    init();
  }, []);

  if (loading) {
    return <Loading message="Loading WordVision..." />;
  } else if (user) {
    return <Redirect href="/library" />;
  } else {
    return (
      <View style={styles.container}>

        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/logo.png")}
            style={styles.logo} />
          <Text style={styles.logoTitle}>WordVision</Text>
          <Text style={styles.logoSubtitle}>Where stories come to life</Text>
        </View>

        <View style={styles.loginBox}>

          <Text style={styles.loginTitle}>Log in</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              onChangeText={setEmail}
              value={email}
            />

          </View>

          <Pressable style={styles.nextButton}>
            <Text style={styles.buttonText}>Continue</Text>
          </Pressable>

          <Text style={styles.buttonText}>- or -</Text>

          <Pressable style={styles.socialButton}>
            <Image
              source={require("@/assets/images/google.png")}
              style={styles.buttonLogo} />
            <Text style={styles.buttonText}>Continue with Google</Text>
          </Pressable>





        </View>

      </View>
    );
  }
}

const styles = StyleSheet.create({


  loginBox: {
    width: "90%",
    padding: 24,
    backgroundColor: "white",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    // boxShadow: 10px 5px 5px red,
    // filter: drop-shadow(30px 10px 4px #4444dd);
  },

  loginTitle: {
    fontFamily: "Quando_400Regular",
    color: "black",
    fontSize: 24,
  },

  inputGroup: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },

  inputLabel: {
    fontFamily: "AtkinsonHyperlegible_400Regular",
    color: "black",
    fontSize: 16
  },

  input: {
    fontFamily: "AtkinsonHyperlegible_400Regular",
    paddingVertical: 4,
    paddingHorizontal: 8,
    color: "black",
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 2
  },

  nextButton: {
    width: "100%",
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: "#80D4FF",
    borderWidth: 1,
    borderRadius: 2
  },

  socialButton: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    width: "100%",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderRadius: 2
  },

  buttonText: {
    fontFamily: "AtkinsonHyperlegible_400Regular",
    textAlign: "center",
    color: "black",
    fontSize: 16,
  },

  container: {
    flex: 1,
    display: "flex",
    gap: 48,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#005675"
  },
  logoContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    height: 78,
    width: 108,
  },
  buttonLogo: {
    height: 20,
    width: 20,
    resizeMode: "cover",
  },
  logoTitle: {
    fontFamily: "Quando_400Regular",
    color: "white",
    fontSize: 40
  },
  logoSubtitle: {
    fontFamily: "AtkinsonHyperlegible_400Regular",
    color: "white",
    fontSize: 14
  },
  uploadButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  // buttonText: {
  //   color: "#FFFFFF",
  //   fontWeight: "bold",
  //   fontSize: 20,
  // },
  textContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
    position: "absolute",
    top: "45%",
    left: "33%",
    backgroundColor: "black",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  centerText: {
    color: "#FFFFFF",
    fontSize: 32, // Larger text
    fontWeight: "bold",
    textAlign: "center",
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
