import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

interface ConfirmationModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  onConfirm,
  onCancel,
  message,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalView}>
          <Text style={styles.modalText}>{message}</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.buttonConfirm]}
              onPress={onConfirm}
            >
              <Text style={styles.textStyle}>Yes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonCancel]}
              onPress={onCancel}
            >
              <Text style={styles.textStyle}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    width: 300,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    width: 100,
    alignItems: "center",
  },
  buttonConfirm: {
    backgroundColor: "#007BFF",
  },
  buttonCancel: {
    backgroundColor: "#DC3545",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default ConfirmationModal;
