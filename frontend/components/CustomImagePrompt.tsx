import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { visualizeHighlight } from '@/utilities/backendService';
import { VisualAnnotation } from '../app/(protected)/(book)/bookReader';
import Loading from '@/components/Loading';
import { useReader } from '@epubjs-react-native/core';


interface CustomPromptModalProps {
  annotation: VisualAnnotation;
  closeHandler: () => void;
  onImageGenerated: (imgUrl: string, prompt: string) => void;
}

export default function CustomImagePrompt({ annotation, closeHandler, onImageGenerated }: CustomPromptModalProps) {

  const {
    updateAnnotation,
  } = useReader();

  const [prompt, setPrompt] = useState<string>(annotation.data.img_prompt);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string>("");
  const [saveErrorMessage, setSaveErrorMessage] = useState<string>("");


  // handle custom text image generation
  const handleCustomImagePrompt = async () => {
    setSaveMessage("Revisualizing highlight...");
    setModalVisible(true);

    if (prompt) {
      try {
        const highlight = await visualizeHighlight(annotation.data.id, prompt);

        updateAnnotation(annotation, {
          id: annotation.data.id,
          img_url: highlight.img_url,
          img_prompt: highlight.img_prompt,
        })

        onImageGenerated(highlight.img_url!, highlight.img_prompt!);
        setModalVisible(false);
        closeHandler();

        return true;
      }
      catch (error: any) {
        if (error.context?.status === 429) {
          const errData: { status: number, message: string, reset: number } = await error.context.json();
          const resetDate = new Date(errData.reset)
          setSaveErrorMessage(`${errData.message}\n\nYour quota resets on ${resetDate.toLocaleString()}`);
        }
        else {
          setSaveErrorMessage("Error revisualizing highlight.");
        }
        console.error("Failed to revisualize highlight", error);
        setSaveError(true);
      }
    }
    else {
      setModalVisible(false);
    }
  }

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      style={{
        position: "absolute",
        height: "100%",
        padding: 32,
        justifyContent: 'center',
        backgroundColor: '#00000040',
      }}
    >

      <View
        style={{
          alignItems: 'center',
          backgroundColor: 'white',
          gap: 8,
          padding: 16,
        }}
      >
        <Text style={{
          fontWeight: 'bold',
          fontSize: 18
        }}>
          Customize image prompt
        </Text>

        <TextInput
          style={{
            width: "100%",
            height: 130,
            borderColor: "black",
            borderWidth: 1,
            borderRadius: 5,
            padding: 10,
            textAlignVertical: "top",
          }}
          value={prompt}
          onChangeText={setPrompt}
          multiline
        />

        <View style={{
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
        }}>

          <Pressable
            style={{
              flex: 1,
              backgroundColor: "blue",
              padding: 10,
              marginHorizontal: 5,
              alignItems: "center",
            }}
            onPress={() => {
              closeHandler();
            }}
          >
            <Text style={{
              fontSize: 16,
              color: 'white',
              fontWeight: 'bold'
            }}>
              Cancel
            </Text>
          </Pressable>

          <Pressable
            style={{
              flex: 1,
              backgroundColor: "blue",
              padding: 10,
              marginHorizontal: 5,
              alignItems: "center",
            }}
            onPress={() => {
              handleCustomImagePrompt();
            }}
          >
            <Text style={{
              fontSize: 16,
              color: 'white',
              fontWeight: 'bold'
            }}>
              Regenerate
            </Text>
          </Pressable>

        </View>
      </View>



      {/* Saving highlight spinner */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            {!saveError ? (
              <Loading message={saveMessage} />
            ) : (
              <>
                <Text>{saveErrorMessage}</Text>
                <Pressable
                  onPress={() => {
                    closeHandler();
                  }}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>

    </Animated.View>
  );
}

const styles = StyleSheet.create({
  contextMenu: {
    position: "absolute",
    backgroundColor: "white",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "black",
    elevation: 5,
    zIndex: 9999,
    padding: 5,
  },
  settingsButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 25,
    zIndex: 1,
  },
  contextMenuItem: {
    padding: 10,
  },
  modalContainer: {
    padding: 16,
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    height: 300,
    width: 300,
    backgroundColor: "white",
    borderRadius: 5,
    paddingHorizontal: 32,
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  imageModalView: {
    width: "100%",
    backgroundColor: "white",
    // backgroundColor: "red",
    borderRadius: 2,
    padding: 16,
    // display: "flex",
    alignItems: "center",
    // justifyContent: "center",
  },
  imageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    width: "80%",
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  closeButtonText: {
    marginTop: 20,
    color: "blue",
    fontWeight: "bold",
    fontSize: 20,
  },
  refreshIcon: {
    marginLeft: 16,
    marginTop: 5,
  },
  editTextIcon: {
    marginLeft: 16,
    marginTop: 3,
  },
  trashIcon: {
    marginLeft: 16,
    marginTop: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    // backgroundColor: "red",
  },
  textInput: {
    // backgroundColor: "red",
    width: "100%",
    height: 150,
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    textAlignVertical: "top",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  button: {
    flex: 1,
    backgroundColor: "blue",
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 5,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold'
  },
  imageHeaderTrash: {
    position: 'absolute',
    top: 11,
    right: 11,
    zIndex: 5,
  },
  visualizeButton: {
    backgroundColor: "#007BFF",
    color: "#FFFFFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  backButton: {
    padding: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },

});

