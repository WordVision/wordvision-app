import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Pressable,
  useColorScheme,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import Feather from "react-native-vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";
import { useReader, Reader, Annotation } from "@epubjs-react-native/core";
import { useFileSystem } from '@epubjs-react-native/expo-file-system';
import { File, Paths, Directory } from 'expo-file-system/next';
import { useLocalSearchParams } from "expo-router";
import { FontAwesome5 } from '@expo/vector-icons';
import {
  BottomSheetModal,
} from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { supabase } from "@/lib/supabase";
import Loading from "@/components/Loading";
import { TableOfContents } from "@/components/TableOfContents";
import { HighlightsList } from "@/components/HighlightsList";
import {
  type Highlight,
  deleteHighlight,
  visualizeHighlight,
  createHighlight,
} from "@/utilities/backendService";

export default function BookReaderPage() {

  /*
    TODO: Implement functions in backend service

    deleteHighlightImage(id: string)
    - deletes the following:
      - image from blob storage
      - img_url from highlight in database
      - img_prompt from highlight in database
    - return boolean based on success

    deleteHighlight(id: string)
    - deletes the following:
      - image from blob storage
      - highlight from database
    - return boolean based on success
  */

  const {
    theme,
    changeFontSize,
    changeFontFamily,
    changeTheme,
    goToLocation,
    addAnnotation,
    updateAnnotation,
    removeAnnotation,
    toc,
    section,
  } = useReader();

  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const navigation = useNavigation();

  const tableOfContentsRef = useRef<BottomSheetModal>(null);
  const highlightsListRef = useRef<BottomSheetModal>(null);

  const colorScheme = useColorScheme();

  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);
  const [bookUrl, setBookUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [custompromptModelVisible, setCustomPromptModelVisible] = useState<boolean>(false);
  const [imageModalVisible, setImageModalVisible] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string>("Saving highlight...");
  const [saveErrorMessage, setSaveErrorMessage] = useState<string>("Error saving highlight.");
  const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(null);
  const [prompt, setPrompt] = useState<string>();


  // Navigation options as a stack child
  useEffect(() => {
    navigation.setOptions({
      title: "Reader",
      headerShown: true,
      headerRight: () => (
        <View style={{
          display: "flex",
          flexDirection: "row",
          gap: 16,
        }}>
          <Pressable
            style={({pressed}) => ({ opacity: pressed ? 0.3 : 1 })}
            onPress={() => highlightsListRef.current?.present()}
          >
            <FontAwesome5 name="quote-left" size={20} color={colorScheme === "dark" ? "white" : "black"} />
          </Pressable>

          <Pressable
            style={({pressed}) => ({ opacity: pressed ? 0.3 : 1 })}
            onPress={() => tableOfContentsRef.current?.present()}
          >
            <FontAwesome5 name="list-ul" size={20} color={colorScheme === "dark" ? "white" : "black"} />
          </Pressable>
        </View>
      ),
    });
  }, [navigation]);


  // Fetch book data
  useEffect(() => {
    if (!bookId) {
      setError("No bookId provided");
      setLoading(false);
      return;
    }

    const fetchBook = async () => {
      setLoading(true);

      const database = await supabase
        .from("books")
        .select(`
          id, filename,
          highlights(
            id,
            text,
            location,
            img_url,
            img_prompt
          )
        `)
        .eq("id", bookId)
        .limit(1)
        .single()

      console.log({databaseData: database.data});

      if (database.data) {
        const file = new File(Paths.cache, database.data.id, database.data.filename);
        if (file.exists) {
          console.log("Found downloaded book.")
          console.log({file: file.uri})
          setBookUrl(file.uri);
        }
        else {
          const destination = new Directory(Paths.cache, database.data.id);
          if (!destination.exists) {
            destination.create();
          }

          const storage = await supabase.storage.from("books").createSignedUrl(database.data.filename, 3600)
          console.log({storage})

          if (storage.data) {

            const url = storage.data.signedUrl;
            console.log("Downloading Book...")

            try {
              const output = await File.downloadFileAsync(url, destination);
              if (output.exists) {
                console.log("Book downloaded!")
                setBookUrl(output.uri);
              }
            }
            catch (error) {
              console.error(error);
            }
          }
          else {
            console.error("Error fetching book from storage:", storage.error);
            setError("Error fetching book.");
          }
        }

        if (database.data.highlights.length > 0) {
          setAnnotations(database.data.highlights.map(annotation => {
            return {
              cfiRange: annotation.location,
              data: {
                id: annotation.id,
                img_url: annotation.img_url,
                img_prompt: annotation.img_prompt
              },
              styles: { color: '#C20114' },
              cfiRangeText: annotation.text,
              type: 'highlight',
            } as Annotation
          }))
        }

      }
      else {
        console.error("Error fetching book data from database:", database.error);
        setError("Error fetching book.");
      }

      setLoading(false);
    };

    fetchBook();

    // setBookUrl("https://s3.amazonaws.com/moby-dick/OPS/package.opf");
    // setLoading(false);
  }, [bookId]);


  const handleVisualizeHighlight = async (cfiRange: string, text: string) => {
    setSaveMessage("Visualizing highlight...");
    setModalVisible(true);

    try {
      const newHighlight = await createHighlight(bookId, cfiRange, text, true);

      addAnnotation(
        'highlight',
        cfiRange,
        {
          id: newHighlight.id,
          img_url: newHighlight.img_url,
          img_prompt: newHighlight.img_prompt,
        },
      );

      setModalVisible(false);
      return true;
    }
    catch (error: any) {
      if (error.context?.status === 429) {
        const errData: { status: number, message: string, reset: number } = await error.context.json();
        const resetDate = new Date(errData.reset)
        setSaveErrorMessage(`${errData.message}\n\nYour quota resets on ${resetDate.toLocaleString()}`);
      }
      else {
        setSaveErrorMessage("Error saving highlight.");
      }
      console.error("Failed to visualize highlight", error);
      setSaveError(true);
    }
  }


  // const handleHighlight = async () => {
  //   if (rendition && selection) {
  //     setSaveMessage("Saving highlight...");
  //     setModalVisible(true);
  //
  //     try {
  //       const response = await createUserHighlight(user, bookId, selection);
  //
  //       if (response) {
  //         setModalVisible(false);
  //         rendition.annotations.add(
  //           "highlight",
  //           selection.location,
  //           undefined,
  //           undefined,
  //           "hl",
  //           {
  //             fill: "red",
  //             "fill-opacity": "0.5",
  //             "mix-blend-mode": "multiply",
  //           }
  //         );
  //         // @ts-ignore: DO NOT REMOVE THIS COMMENT
  //         // This annotation was added because typescript throws an error
  //         //   for getContents()[0]
  //         // The return type for getContents() is outdated and actually returns
  //         //   Contents[] instead of Contents
  //         rendition.getContents()[0]?.window?.getSelection()?.removeAllRanges();
  //
  //         setHighlights(prev => {
  //           return [
  //             ...prev,
  //             {
  //               id: response.highlightId,
  //              ...selection,
  //             }
  //           ]
  //         });
  //
  //         setSaveError(false);
  //       } else {
  //         console.error("Failed to save highlight", response);
  //         setSaveError(true);
  //       }
  //     } catch (error) {
  //       console.error("Failed to save highlight", error);
  //       setSaveError(true);
  //     }
  //   }
  //   setContextMenu({ visible: false, x: 0, y: 0 });
  // };


  // const handleRegenerate = async () => {
  //   if (!selectedHighlight || !selectedHighlight.imgUrl) return;
  //
  //   try {
  //     const imgUrl = selectedHighlight.imgUrl;
  //     const highlightId = imgUrl.split("/").pop()?.replace(".png", "");
  //
  //     if (!highlightId) {
  //       console.error("Unable to extract highlight ID from imgUrl:", imgUrl);
  //       return;
  //     }
  //
  //     setModalVisible(true);
  //
  //     const putSuccess = await regenerateHighlightImage(
  //       user,
  //       bookId,
  //       highlightId
  //     );
  //
  //     if (putSuccess) {
  //       const updatedHighlight = await fetchUpdatedHighlight(
  //         user,
  //         bookId,
  //         highlightId
  //       );
  //
  //       const timestampedUrl = `${updatedHighlight.imgUrl}?t=${new Date().getTime()}`;
  //
  //       setHighlights(
  //         highlights.map((h) =>
  //           h.location === selectedHighlight?.location
  //             ? { ...h, imgUrl: timestampedUrl }
  //             : h
  //         )
  //       );
  //       setSelectedHighlight({ ...updatedHighlight, imgUrl: timestampedUrl });
  //     }
  //   } catch (error) {
  //
  //     console.error(
  //       "Error in regenerating image or fetching updated highlight:",
  //       error
  //     );
  //
  //   } finally {
  //     setModalVisible(false);
  //   }
  // };


  // const handleGenerateNewImage = async (highlight: Selection) => {
  //   if (!highlight || !highlight.text || !highlight.id) {
  //     console.error("Invalid highlight selected for image generation");
  //     return;
  //   }
  //
  //   try {
  //     // Show the loading modal
  //     setSaveMessage("Generating image...");
  //     setModalVisible(true);
  //
  //     // Generate the new image using the backend service
  //     const newImageUrl = await generateHighlightImage(user, bookId, highlight.id);
  //
  //     // Update the highlights array with the new image URL
  //     setHighlights((prevHighlights) =>
  //       prevHighlights.map((h) =>
  //         h.id === highlight.id ? { ...h, imgUrl: newImageUrl } : h
  //       )
  //     );
  //
  //     // Update the selected highlight if it matches the generated one
  //     setSelectedHighlight((prev) => {
  //       if (prev && prev.id === highlight.id) {
  //         return {
  //           ...prev,
  //           imgUrl: newImageUrl,
  //         }
  //       }
  //       return prev;
  //     });
  //
  //     console.log("Image successfully generated:", newImageUrl);
  //   } catch (error) {
  //     console.error("Error while generating new image:", error);
  //     setSaveError(true);
  //   } finally {
  //     // Hide the loading modal
  //     setModalVisible(false);
  //   }
  // };


  // handle custom text image generation
  const handleCustomImagePrompt = async () => {
    setSaveMessage("Revisualizing highlight...");
    setModalVisible(true);

    if (prompt) {
      try {
        const highlight = await visualizeHighlight(selectedAnnotation?.data.id, prompt);

        updateAnnotation(selectedAnnotation!, {
          img_url: highlight.img_url,
          img_prompt: highlight.img_prompt,
        })

        setModalVisible(false);
        setImageModalVisible(false);
        setCustomPromptModelVisible(false);
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
        setCustomPromptModelVisible(false);
        setSaveError(true);
      }
    }
    else {
      setModalVisible(false);
    }
  }


  // Function to handle delete image highlight
  const deleteImageHighlight = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `http://localhost:8000/book/${bookId}/highlight/${highlightId}/image`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
          },
        }
      );

      if (response.ok) {
        setHighlights((prevHighlights) =>
          prevHighlights.map((item) =>
            item.id === highlightId ? { ...item, imgUrl: undefined } : item
          )
        );
        setImageModalVisible(false);
      } else {
        const errorData = await response.json();
        setError(`Error removing image: ${errorData.message}`);
      }
    } catch (err) {
      console.log(`Exception while calling the delete API: ${err}.`);
      setError("Error removing image.");
    } finally {
      setLoading(false);
    }
  };


  // Delete highlight with no text from the model
  const handleDeletehighlight = async () => {
    if (selectedHighlight) {
      setLoading(true);
      setError(null);

      try {
        // Call the delete API
        await deleteHighlight(user, bookId, selectedHighlight.id);

        // Remove the selected highlight from the list
        setHighlights((prevHighlights) =>
          prevHighlights.filter((item) => item.id !== selectedHighlight.id)
        );

        // Optionally clear the selectedHighlight
        setSelectedHighlight(null);
      } catch (err) {
        console.log(`Exception while calling the delete API: ${err}.`);
        setError("Error removing image.");
      } finally {
        setLoading(false);
        setImageModalVisible(false);
      }
    }
  };



  if (loading) {
    return <Loading message="Loading book..."/>
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView>
      <View style={{ flex: 1 }}>
        {bookUrl ? (
          <Reader
            src={bookUrl}
            fileSystem={useFileSystem}
            waitForLocationsReady
            onPressAnnotation={(annotation) => {
              setSelectedAnnotation(annotation);
              setPrompt(annotation.data.img_prompt);
              setImageModalVisible(true);
            }}
            initialAnnotations={annotations}
            menuItems={[
              {
                label: 'Visualize',
                action: (cfiRange, text) => {
                  handleVisualizeHighlight(cfiRange, text);
                  return true;
                }
              },
            ]}
          />
        ) : (
          <Text>Book URL is not available.</Text>
        )}



        <TableOfContents
          ref={tableOfContentsRef}
          onPressSection={(section) => {
            goToLocation(section.href.split('/')[1]);
            tableOfContentsRef.current?.dismiss();
          }}
          onClose={() => tableOfContentsRef.current?.dismiss()}
        />



        <HighlightsList
          ref={highlightsListRef}
          onPressItem={(annotation) => {
            goToLocation(annotation.cfiRange);
            highlightsListRef.current?.dismiss();
          }}
          onClose={() => highlightsListRef.current?.dismiss()}
        />



        <Modal
          animationType="slide"
          transparent={true}
          visible={imageModalVisible}
          onRequestClose={() => setImageModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.imageModalView}>
              {selectedAnnotation?.data?.img_url ? (
                <>
                  <View style={styles.imageHeader}>

                    <Text style={{ fontSize: 20 }}>Generated image:</Text>

                    {/*
                    <TouchableOpacity onPress={handleRegenerate}>
                      <Icon
                        name="refresh"
                        size={19}
                        color="#000000"
                        style={styles.refreshIcon}
                      />
                    </TouchableOpacity>
                    */}

                    <TouchableOpacity
                      onPress={() => {
                        setPrompt(selectedAnnotation.data.img_prompt);
                        setCustomPromptModelVisible(true);
                      }}
                    >
                      <Feather
                        name="edit"
                        size={19}
                        color="#000000"
                        style={styles.editTextIcon}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={deleteImageHighlight}>
                      <Icon name="trash" size={19} style={styles.trashIcon} />
                    </TouchableOpacity>

                  </View>

                  <Image
                    source={{ uri: selectedAnnotation?.data?.img_url }}
                    style={{ width: 300, height: 300 }}
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
                      onPress={handleDeletehighlight}
                    />
                  </View>
                  <Text>No image available for this highlight.</Text>
                  <TouchableOpacity
                    style={styles.visualizeButton}
                    onPress={() => {
                    if (selectedHighlight && !selectedHighlight.img_url) {
                      handleGenerateNewImage(selectedHighlight);
                    } else {
                      console.error("Highlight already has an image or is invalid");
                    }
                  }}
                >
                  <Text style={styles.buttonText}>Visualize</Text>
                  </TouchableOpacity>
                </>
              )}
              <TouchableOpacity onPress={() => setImageModalVisible(false)}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>


        {/* Custom Prompt */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={custompromptModelVisible}
          onRequestClose={() => setCustomPromptModelVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.imageModalView}>
              <Text style={styles.title}>Customize prompt</Text>

              <TextInput
                style={styles.textInput}
                value={prompt}
                onChangeText={setPrompt}
                multiline
              />
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => setCustomPromptModelVisible(false)}
                >
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    handleCustomImagePrompt();
                  }}
                >
                  <Text style={styles.buttonText}>Regenerate</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>



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
                  <TouchableOpacity
                    onPress={() => {
                      setModalVisible(false);
                      setSaveError(false);
                    }}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        </Modal>

      </View>
    </GestureHandlerRootView>
  );
};

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

