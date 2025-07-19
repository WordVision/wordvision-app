import { Pressable, Platform, View, Modal, Text, StyleSheet } from "react-native";

interface LocationSyncMenuProps {
  show: boolean;
  onClose: () => void;
  onNo: () => void;
  onYes: () => void;
  localLocation: string;
  remoteLocation: string;
}

export default function LocationSyncMenu(p: LocationSyncMenuProps) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={p.show}
      onRequestClose={p.onClose}
    >
      <View style={styles.modalScreenContainer}>
        <View style={styles.modalContentContainer}>
          <Text style={styles.text}>
            Current location is different from last read location from another device.
          </Text>

          <Text style={styles.text}>
            local: {p.localLocation} | remote: {p.remoteLocation}
          </Text>

          <Text style={styles.text}>
            Go to that location?
          </Text>

          <View
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "row",
              gap: 12,
            }}
          >
            <Pressable
              onPress={p.onNo}
              style={({ pressed }) => ({
                backgroundColor: pressed ? "#E2E4E9" : "#F6F8FA",
                ...styles.button
              })}
            >
              <Text style={{
                color: "#525866",
                fontFamily: Platform.select({
                  android: 'Inter_400Regular',
                  ios: 'Inter-Regular',
                }),
                ...styles.buttonText,
              }}>
                No
              </Text>
            </Pressable>

            <Pressable
              onPress={p.onYes}
              style={({pressed}) => ({
                backgroundColor: pressed ? "#253EA7" : "#375DFB",
                ...styles.button,
              })}
            >
              <Text style={{
                color: "white",
                fontFamily: Platform.select({
                  android: 'Inter_600SemiBold',
                  ios: 'Inter-SemiBold',
                }),
                ...styles.buttonText
              }}>
                Yes
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "rgba(0, 0, 0, 0.25)"
  },

  modalContentContainer: {
    width: "80%",
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    gap: 12,
    display: "flex",
  },

  text: {
    fontSize: 16,
    fontFamily: Platform.select({
      android: 'Inter_500Medium',
      ios: 'Inter-Medium',
    }),
  },

  button: {
    flex: 1,
    borderRadius: 100,
    borderWidth: 1,
    borderColor: "#E2E4E9",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  buttonText: {
    textAlign: "center",
    fontSize: 14,
  }
})

