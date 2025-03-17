import React, { useEffect } from "react";
import { Alert } from "react-native";

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
  useEffect(() => {
    if (visible) {
      Alert.alert(
        "Confirmation", // Title
        message, // Message
        [
          {
            text: "Confirm",
            onPress: onConfirm, // Calls onConfirm function
          },
          {
            text: "Cancel",
            style: "cancel",
            onPress: onCancel, // Calls onCancel function
          },
        ]
      );
    }
  }, [visible]);

  return null; // No UI needed, Alert handles the display
};

export default ConfirmationModal;
