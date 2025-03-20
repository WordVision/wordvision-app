import { useState, useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import ParallaxScrollView from "@/components/ParallaxScrollView";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedTextInput } from "@/components/ThemedTextInput";
import { ThemedButton } from "@/components/ThemedButton";

import { supabase } from "@/lib/supabase";

interface UserInfo {
  first_name: string;
  last_name: string;
  birthdate: string;
  email: string;
}

export default function user() {

  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [originalData, setOriginalData] = useState<UserInfo>({
    first_name: "",
    last_name: "",
    birthdate: "",
    email: "",
  });

  useEffect(() => {
    async function init() {
      setLoading(true);

      console.debug("inside user init()");

      const { data, error } = await supabase.auth.getUser();

      if (data.user) {
        const user = data.user.user_metadata as UserInfo;

        setFirstName(user.first_name);
        setLastName(user.last_name);
        setBirthdate(user.birthdate.split("T")[0]);
        setEmail(user.email);

        setOriginalData({
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          birthdate: user.birthdate.split("T")[0]
        }); // Set the initial state
      }
      else {
        console.error(error?.message)
      }

      setLoading(false);
    }

    init();
  }, []);

  const handleSave = async () => {
    const { data, error } = await supabase.auth.updateUser({
      data: {
        first_name: firstName,
        last_name: lastName,
        birthdate: (new Date(birthdate)).toJSON()
      }
    });

    if (data) {
      setOriginalData({
        first_name: firstName,
        last_name: lastName,
        email,
        birthdate
      });

      setEditMode(false);
    }
    else {
      console.error(error);
    }
  };

  const handleCancel = () => {
    // Revert the state to the last saved original data
    setFirstName(originalData.first_name);
    setLastName(originalData.last_name);
    setBirthdate(originalData.birthdate);
    setEmail(originalData.email);
    setEditMode(false);
  };

  const onChangeBirthdate = (newDate: string) => {
    // Remove any non-digits
    const digitsOnly = newDate.replace(/\D/g, '').slice(0, 8);

    let formatted = '';
    if (digitsOnly.length > 0) {

      // Add year part
      formatted += digitsOnly.slice(0, Math.min(4, digitsOnly.length));

      // Add month part with dash
      if (digitsOnly.length > 4) {
        formatted += '-' + digitsOnly.slice(4, Math.min(6, digitsOnly.length));
      }

      // Add day part with dash
      if (digitsOnly.length > 6) {
        formatted += '-' + digitsOnly.slice(6, 8);
      }
    }

    setBirthdate(formatted);
  }

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <Ionicons size={310} name="person-outline" style={styles.headerImage} />
      }
    >
      <ThemedView style={styles.centeredContainer}>
        <ThemedText type="title" style={styles.title}>
          User Profile
        </ThemedText>

        {loading ? (
          <View style={styles.inputContainer}>
            <ThemedText type="default">Loading user info...</ThemedText>
          </View>
        ) : (
          <>
            <View style={styles.inputContainer}>
              <View>
                <ThemedText type="default">Email</ThemedText>
                <ThemedTextInput
                  style={[{backgroundColor: editMode ? "#d9d9d9" : "white"}, styles.input]}
                  onChangeText={setEmail}
                  value={email}
                  editable={false}
                />
              </View>

              <View style={styles.splitInput}>
                <View style={styles.inputGroup}>
                  <ThemedText type="default">First Name</ThemedText>
                  <ThemedTextInput
                    style={styles.input}
                    onChangeText={setFirstName}
                    value={firstName}
                    editable={editMode}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <ThemedText type="default">Last Name</ThemedText>
                  <ThemedTextInput
                    style={styles.input}
                    onChangeText={setLastName}
                    value={lastName}
                    editable={editMode}
                  />
                </View>
              </View>

              <View>
                <ThemedText type="default">Birthdate</ThemedText>
                <ThemedTextInput
                  style={styles.input}
                  onChangeText={onChangeBirthdate}
                  value={birthdate}
                  editable={editMode}
                  placeholder="yyyy-mm-dd"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.buttonContainer}>
              {editMode ? (
                <>
                  <ThemedButton
                    style={styles.button}
                    lightFg="white"
                    lightBg="rgb(34 197 94)"
                    darkFg="white"
                    darkBg="rgb(21 128 61)"
                    title="Save"
                    onPress={handleSave}
                  />
                  <ThemedButton
                    style={styles.button}
                    lightFg="white"
                    lightBg="rgb(185 28 28)"
                    darkFg="rgb(254 226 226)"
                    darkBg="rgb(248 113 113)"
                    title="Cancel"
                    onPress={handleCancel}
                  />
                </>
              ) : (
                <ThemedButton
                  style={styles.button}
                  lightFg="white"
                  lightBg="#3994ec"
                  darkFg="white"
                  darkBg="#393aec"
                  title="Edit"
                  onPress={() => setEditMode(true)}
                />
              )}

              {!editMode && (
                <>
                  <ThemedButton
                    style={styles.button}
                    lightFg="white"
                    lightBg="rgb(34 197 94)"
                    darkFg="white"
                    darkBg="rgb(21 128 61)"
                    title="Sign Out"
                    onPress={() => supabase.auth.signOut()}
                  />
                </>
              )}
            </View>
          </>
        )}
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    color: "#808080",
    bottom: -90,
    left: -35,
    position: "absolute",
  },

  centeredContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },

  title: {
    textAlign: "center",
    fontSize: 20,
  },

  inputContainer: {
    width: "100%",
    display: "flex",
    gap: 8,
  },

  splitInput: {
    maxWidth: "100%",
    display: "flex",
    flexDirection: "row",
    gap: 8,
  },

  inputGroup: {
    flex: 1
  },

  input: {
    height: 40,
    borderWidth: 1,
    padding: 10,
  },

  buttonContainer: {
    padding: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-around",
    gap: 4,
  },

  button: {
    width: 135,
  },
});
