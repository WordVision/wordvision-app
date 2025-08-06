import { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Text,
  Modal,
} from "react-native";
import { useRouter, useNavigation } from "expo-router";

import HeaderLayout from "@/components/Headerlayout";
import Avatar from "@/components/Avatar";
import Icon from "@/components/Icon";

import { supabase } from "@/lib/supabase";
import { TextInput } from "react-native";
import { ThemedText } from "@/components/ThemedText";

interface UserInfo {
  first_name: string;
  last_name: string;
  birthdate: string;
  email: string;
}

export default function User() {
  const router = useRouter();
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
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
          birthdate: user.birthdate.split("T")[0],
        });
      } else {
        console.error(error?.message);
      }

      setLoading(false);
    }

    init();
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const handleSave = async () => {
    const { data, error } = await supabase.auth.updateUser({
      data: {
        first_name: firstName,
        last_name: lastName,
        birthdate: new Date(birthdate).toJSON(),
      },
    });

    if (data) {
      setOriginalData({
        first_name: firstName,
        last_name: lastName,
        email,
        birthdate,
      });

      setEditMode(false);
    } else {
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
    const digitsOnly = newDate.replace(/\D/g, "").slice(0, 8);

    let formatted = "";
    if (digitsOnly.length > 0) {
      // Add year part
      formatted += digitsOnly.slice(0, Math.min(4, digitsOnly.length));

      // Add month part with dash
      if (digitsOnly.length > 4) {
        formatted += "-" + digitsOnly.slice(4, Math.min(6, digitsOnly.length));
      }

      // Add day part with dash
      if (digitsOnly.length > 6) {
        formatted += "-" + digitsOnly.slice(6, 8);
      }
    }

    setBirthdate(formatted);
  };

  const formatBirthDate = (dateString: any) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <View style={styles.container}>
      <HeaderLayout text="Profile">
        <TouchableOpacity
          style={styles.closeButton}
          activeOpacity={0.7}
          onPress={() => router.push("/(protected)/(home)/(tabs)/library")}
        >
          <Icon name="close" fill="black" width={40} height={40} />
        </TouchableOpacity>
      </HeaderLayout>

      {loading ? (
        <View style={styles.inputContainer}>
          <ThemedText type="default">Loading user info...</ThemedText>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.avatarSection}>
            <Avatar
              firstName={firstName}
              lastName={lastName}
              width={72}
              height={72}
              fontSize={28}
            />
            {editMode ? (
              <TextInput style={styles.fullName}>
                {firstName} {lastName}
              </TextInput>
            ) : (
              <Text style={styles.fullName}>
                {firstName} {lastName}
              </Text>
            )}
          </View>
          <View style={styles.infoSection}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              editable={editMode}
              style={styles.userInput}
            />
          </View>
          <View style={styles.infoSection}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              value={firstName}
              editable={editMode}
              style={styles.userInput}
            />
          </View>
          <View style={styles.infoSection}>
            <Text style={styles.label}>Last Name</Text>
            <TextInput
              value={lastName}
              editable={editMode}
              style={styles.userInput}
            />
          </View>
          <View style={styles.infoSection}>
            <Text style={styles.label}>Date of Birth</Text>
            <TextInput
              value={formatBirthDate(birthdate)}
              onChangeText={setBirthdate}
              placeholder="yyyy-mm-dd"
              keyboardType="numeric"
              style={styles.userInput}
              editable={editMode}
            />
          </View>
          {/* Edit feature TODO */}
          {/* {editMode ? (
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.editButton, styles.editButtonText]}
                onPress={() => setEditMode(!editMode)}
              >
                <Text style={styles.editButtonText}>Save</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.editButton, styles.cancelButton]}
                onPress={() => setEditMode(!editMode)}
              >
                <Text style={styles.editButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditMode(!editMode)}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )} */}
        </ScrollView>
      )}

      <TouchableOpacity
        style={styles.logOutButton}
        accessibilityLabel="Sign Out"
        activeOpacity={0.7}
        onPress={() => setModalVisible(true)}
      >
        <Icon name="logout" fill="red" width={28} height={28} />
        <Text style={styles.logOutButtonText}>Logout</Text>
      </TouchableOpacity>

      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <View style={styles.iconCircle}>
                <Icon name="logout" fill="black" width={30} height={30} />
              </View>
              <Text style={styles.title}>Are you sure you want to logout?</Text>
            </View>
            <View style={styles.modelButtonRow}>
              <TouchableOpacity
                style={styles.modelCancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modelCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modelLogoutButton}
                onPress={() => {
                  supabase.auth.signOut();
                }}
              >
                <Text style={styles.modelLogoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    marginTop: 35,
  },
  inputContainer: {
    width: "100%",
    display: "flex",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
    fontSize: 16,
  },
  closeButton: {
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 24,
    borderBottomWidth: 2,
    borderBottomColor: "#D9D9D9",
    paddingBottom: 16,
  },
  fullName: {
    fontSize: 22,
    fontWeight: "500",
    marginTop: 8,
  },
  infoSection: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderBottomWidth: 2,
    borderBottomColor: "#D9D9D9",
    marginBottom: 4,
  },
  label: {
    paddingHorizontal: 8,
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  userInput: {
    paddingHorizontal: 8,
    fontSize: 17,
    fontWeight: "500",
  },
  editButton: {
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 9999,
    backgroundColor: "#4F7BFE",
  },
  editButtonText: {
    maxWidth: "100%",
    paddingHorizontal: 10,
    color: "white",
    fontWeight: "600",
    fontSize: 20,
  },
  cancelButton: {
    backgroundColor: "#4CAF50",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  logOutButton: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingVertical: 16,
    borderRadius: 12,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  logOutButtonText: {
    color: "red",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 5,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 30,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 20,
  },
  title: {
    flex: 1,
    fontSize: 20,
    color: "#333",
    marginLeft: 10,
    fontWeight: "600",
  },
  modelButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  modelCancelButton: {
    flex: 1,
    backgroundColor: "#f1f1f1",
    paddingVertical: 12,
    borderRadius: 10,
    marginRight: 10,
    alignItems: "center",
  },
  modelLogoutButton: {
    flex: 1,
    backgroundColor: "#375DFB",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  modelCancelText: {
    color: "black",
    fontWeight: "600",
    fontSize: 16,
  },
  modelLogoutText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
});
