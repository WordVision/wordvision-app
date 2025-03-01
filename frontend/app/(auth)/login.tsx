import {
  Image,
  StyleSheet,
  View,
  TextInput,
  Text,
  Pressable,
  Alert
} from "react-native";
import { useState, useEffect } from "react";
import { useNavigation, Link, useRouter } from "expo-router";
import Icon from "react-native-vector-icons/Ionicons";
import { supabase } from '@/lib/supabase'

export default function LandingPage() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  async function signInWithEmail() {
    setLoading(true)

    const { data: { session }, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) {
      Alert.alert(error.message)
      console.log(error);
    }

    if (session) {
      setEmail("");
      setPassword("");
      router.navigate("/library");
    }

    setLoading(false);
  }

  async function signInWithGoogle() {
    Alert.alert("will be available soon...")
  }

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo} />
        <Text style={styles.logoTitle}>WordVision</Text>
      </View>
      <View style={styles.loginBox}>
        <View style={styles.navHeader}>
          <Link dismissTo href="/" asChild>
            <Icon name="arrow-back" size={24} />
          </Link>

          <Text style={styles.loginTitle}>Sign in</Text>
        </View>
        <View style={styles.inputGroupContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              inputMode="email"
              autoCapitalize="none"
              onChangeText={setEmail}
              inputMode="email"
              autoCapitalize="none"
              value={email}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              onChangeText={setPassword}
              value={password}
              autoCapitalize="none"
              secureTextEntry={true}
            />
          </View>
        </View>
        <Pressable style={styles.nextButton} disabled={loading} onPress={() => signInWithEmail()}>
          <Text style={styles.buttonText}>Sign in</Text>
        </Pressable>
        <Text style={styles.buttonText}>- or -</Text>
        <Pressable style={styles.socialButton} onPress={() => signInWithGoogle()}>
          <Image
            source={require("@/assets/images/google.png")}
            style={styles.buttonLogo} />
          <Text style={styles.buttonText}>Continue with Google</Text>
        </Pressable>
        <Text style={styles.buttonText}>
          Don't have an account?
          <Link style={styles.signup} href="/signup"> Sign up</Link>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    display: "flex",
    gap: 12,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#005675",
    padding: 16,
  },

  logoContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },

  logo: {
    height: 60,
    width: 80,
  },

  logoTitle: {
    fontFamily: "Quando_400Regular",
    color: "white",
    fontSize: 32
  },

  loginBox: {
    width: "90%",
    padding: 24,
    backgroundColor: "white",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },

  navHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  loginTitle: {
    fontFamily: "Quando_400Regular",
    color: "black",
    fontSize: 24,
  },

  inputGroupContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
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
    paddingVertical: 8,
    paddingHorizontal: 12,
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

  buttonText: {
    fontFamily: "AtkinsonHyperlegible_400Regular",
    textAlign: "center",
    color: "black",
    fontSize: 16,
    display: "flex",
    flexDirection: "row",
    gap: 12
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

  buttonLogo: {
    height: 20,
    width: 20,
    resizeMode: "cover",
  },

  signup: {
    color: "#005675",
  },
});
