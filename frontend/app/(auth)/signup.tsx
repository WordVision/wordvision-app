import {
  Image,
  StyleSheet,
  View,
  TextInput,
  Text,
  Pressable,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { useState, useEffect } from "react";
import { useNavigation } from "expo-router";
import Icon from "react-native-vector-icons/Ionicons";
import { supabase } from '@/lib/supabase'
import { makeRedirectUri } from "expo-auth-session";
import DateTimePicker from '@react-native-community/datetimepicker';


export default function LandingPage() {

  const redirectTo = makeRedirectUri();
  const navigation = useNavigation();

  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [birthdate, setBirthdate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPass, setConfirmPass] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    navigation.setOptions({ headerShown: false });

    console.log(redirectTo);
  }, [navigation]);

  async function signUpWithEmail() {
    setLoading(true)
    const { data: { session }, error, } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: redirectTo + "/login"
      }
    })

    if (error) Alert.alert(error.message)
    if (!session) Alert.alert('Please check your inbox for email verification!')
    setLoading(false)
  }

  // function openDatePicker() {
  //   DateTimePickerAndroid.open({
  //     value: birthdate,
  //     onChange: (_event, selectedDate) => {
  //       const currentDate = selectedDate;
  //       if (currentDate) setBirthdate(currentDate);
  //     },
  //     mode: "date",
  //   });
  // };

  const onChange = (event: any, selectedDate: any) => {
    const currentDate = selectedDate;
    setShowDatePicker(false);
    setBirthdate(currentDate);
  };

  return (
    <View style={styles.container}>

      <View style={styles.logoContainer}>
        <Image
          source={require("@/assets/images/logo.png")}
          style={styles.logo}
        />
        <Text style={styles.logoTitle}>WordVision</Text>
      </View>

      <View style={styles.loginBox}>

        <View style={styles.navHeader}>
          <Pressable onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} />
          </Pressable>

          <Text style={styles.loginTitle}>Sign up</Text>
        </View>

        <ScrollView style={styles.inputGroupContainer}>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>First Name</Text>
            <TextInput
              style={styles.input}
              onChangeText={setFirstName}
              value={firstName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Last Name</Text>
            <TextInput
              style={styles.input}
              onChangeText={setLastName}
              value={lastName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Email<Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              inputMode="email"
              autoCapitalize="none"
              onChangeText={setEmail}
              value={email}
            />
          </View>

          {Platform.OS === "web" ?
            <View style={styles.inputGroup} >
              <Text style={styles.inputLabel}>
                Birthdate<Text style={styles.required}>*</Text>
              </Text>
              <input type="date" style={styles.input}/>
            </View>
              :
            <>
              <Pressable
                style={styles.inputGroup}
                onPress={() => { setShowDatePicker(true)}}
              >
                <Text style={styles.inputLabel}>
                  Birthdate<Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.input}
                  editable={false}
                  value={birthdate.toLocaleDateString()}
                />
              </Pressable>

              {showDatePicker &&
                <DateTimePicker
                  testID="dateTimePicker"
                  value={birthdate}
                  mode="date"
                  onChange={onChange}
                />
              }
          </>}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Password<Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              onChangeText={setPassword}
              autoCapitalize="none"
              value={password}
              secureTextEntry={true}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              Confirm Password<Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              onChangeText={setConfirmPass}
              autoCapitalize="none"
              value={confirmPass}
              secureTextEntry={true}
            />
          </View>

        </ScrollView>

        <Pressable
          style={styles.submit}
          disabled={loading}
          onPress={() => signUpWithEmail()}
        >
          <Text style={styles.buttonText}>Sign up</Text>
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

const styles = StyleSheet.create({
  required: {
    color: "#FF4A4A"
  },

  inputGroupContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
    maxHeight: 300,
  },

  navHeader: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  signup: {
    color: "#005675",
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

  buttonLogo: {
    height: 20,
    width: 20,
    resizeMode: "cover",
  },


  loginBox: {
    width: "90%",
    padding: 24,
    backgroundColor: "white",
    display: "flex",
    flexDirection: "column",
    gap: 16,
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
    paddingVertical: 8,
    paddingHorizontal: 12,
    color: "black",
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 2
  },

  submit: {
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
    display: "flex",
    flexDirection: "row",
    gap: 12
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
