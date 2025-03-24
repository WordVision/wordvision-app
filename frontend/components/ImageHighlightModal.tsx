import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import Feather from "react-native-vector-icons/Feather";
import type { Annotation } from "@epubjs-react-native/core";
import type { Highlight, Selection } from "@/utilities/backendService";

type Props = {
  visible: boolean;
  annotation: Annotation | null;
  selectedHighlight: Highlight | null;
  onClose: () => void;
  onRegenerate: () => void;
  onDeleteHighlight: () => void;
  onDeleteImage: () => void;
  onGenerateImage: (highlight: Selection) => void;
  onCustomPrompt: () => void;
};

export const ImageHighlightModal = ({
  visible,
  annotation,
  selectedHighlight,
  onClose,
  onRegenerate,
  onDeleteHighlight,
  onDeleteImage,
  onGenerateImage,
  onCustomPrompt,
}: Props) => {
  return (
    <Modal
      animationType="slide"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.imageModalView}>
          {annotation?.data?.img_url ? (
            <>
              <View style={styles.imageHeader}>
                <Text style={{ fontSize: 20 }}>Generated image:</Text>
                <TouchableOpacity onPress={onRegenerate}>
                  <Icon
                    name="refresh"
                    size={19}
                    color="#000"
                    style={styles.refreshIcon}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={onCustomPrompt}>
                  <Feather
                    name="edit"
                    size={19}
                    color="#000"
                    style={styles.editTextIcon}
                  />
                </TouchableOpacity>
                <TouchableOpacity onPress={onDeleteImage}>
                  <Icon name="trash" size={19} style={styles.trashIcon} />
                </TouchableOpacity>
              </View>
              <Image
                source={{ uri: annotation?.data?.img_url }}
                style={{ width: 425, height: 425 }}
                resizeMode="contain"
              />
            </>
          ) : (
            <>
              <View style={styles.imageHeaderTrash}>
                <Icon
                  name="trash"
                  size={24}
                  style={{ color: "gray", marginHorizontal: 10 }}
                  onPress={onDeleteHighlight}
                />
              </View>
              <Text>No image available for this highlight.</Text>
              <TouchableOpacity
                style={styles.visualizeButton}
                onPress={() => {
                  if (selectedHighlight && !selectedHighlight.img_url) {
                    onGenerateImage(selectedHighlight);
                  } else {
                    console.error(
                      "Highlight already has an image or is invalid"
                    );
                  }
                }}
              >
                <Text style={styles.buttonText}>Visualize</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
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
  imageModalView: {
    width: 550,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 50,
    alignItems: "center",
  },
  imageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  refreshIcon: { marginLeft: 16, marginTop: 5 },
  editTextIcon: { marginLeft: 16, marginTop: 3 },
  trashIcon: { marginLeft: 16, marginTop: 5 },
  imageHeaderTrash: {
    position: "absolute",
    top: 11,
    right: 11,
    zIndex: 5,
  },
  visualizeButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "bold",
  },
  closeButtonText: {
    marginTop: 20,
    color: "blue",
    fontWeight: "bold",
    fontSize: 20,
  },
});
