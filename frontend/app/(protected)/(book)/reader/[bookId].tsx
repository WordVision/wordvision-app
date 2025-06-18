import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  useColorScheme,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useReader, Reader, Annotation } from "@epubjs-react-native/core";
import { useFileSystem } from "@epubjs-react-native/expo-file-system";
import { File, Paths, Directory } from "expo-file-system/next";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FontAwesome5 } from "@expo/vector-icons";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { supabase } from "@/lib/supabase";
import Loading from "@/components/Loading";

import { TableOfContents } from "./components/TableOfContents";
import { HighlightsList } from "./components/HighlightsList";
import {
  type Highlight,
  deleteHighlight,
  visualizeHighlight,
  createHighlight,
} from "@/utilities/backendService";

export type VisualAnnotation = Annotation<{
  id: string;
  img_url: string;
  img_prompt: string;
}>;

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

  const { goToLocation, addAnnotation, updateAnnotation } = useReader();

  const { bookId } = useLocalSearchParams();

  const navigation = useNavigation();
  const router = useRouter();

  const tableOfContentsRef = useRef<BottomSheetModal>(null);
  const highlightsListRef = useRef<BottomSheetModal>(null);

  const colorScheme = useColorScheme();

  const [annotations, setAnnotations] = useState<VisualAnnotation[]>([]);
  const [selectedAnnotation, setSelectedAnnotation] =
    useState<VisualAnnotation | null>(null);
  const [bookUrl, setBookUrl] = useState<string | null>(null);
  const [loadingBook, setLoadingBook] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoadingModal, setShowLoadingModal] = useState<boolean>(false);
  const [showEmptyModal, setShowEmptyModal] = useState<boolean>(false);
  const [imageModalVisible, setImageModalVisible] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string>("Saving highlight...");
  const [saveErrorMessage, setSaveErrorMessage] = useState<string>(
    "Error saving highlight."
  );
  const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(
    null
  );
  const [bookTitle, setBookTitle] = useState<string | null>(null);

  // Navigation options as a stack child
  useEffect(() => {
    navigation.setOptions({
      title: "Reader",
      headerShown: true,
      headerRight: () => (
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 16,
          }}
        >
          <Pressable
            style={({ pressed }) => ({ opacity: pressed ? 0.3 : 1 })}
            onPress={() => highlightsListRef.current?.present()}
          >
            <FontAwesome5
              name="quote-left"
              size={20}
              color={colorScheme === "dark" ? "white" : "black"}
            />
          </Pressable>

          <Pressable
            style={({ pressed }) => ({ opacity: pressed ? 0.3 : 1 })}
            onPress={() => tableOfContentsRef.current?.present()}
          >
            <FontAwesome5
              name="list-ul"
              size={20}
              color={colorScheme === "dark" ? "white" : "black"}
            />
          </Pressable>
        </View>
      ),
    });
  }, [navigation]);

  // Fetch book data
  useEffect(() => {
    if (!bookId) {
      setError("No bookId provided");
      setLoadingBook(false);
      return;
    }

    const fetchBook = async () => {
      setLoadingBook(true);

      const database = await supabase
        .from("books")
        .select(
          `
          id, filename,
          highlights(
            id,
            text,
            location,
            img_url,
            img_prompt
          )
        `
        )
        .eq("id", bookId)
        .limit(1)
        .single();

      console.log({ databaseData: database.data });

      if (database.data) {
        const file = new File(
          Paths.cache,
          database.data.id,
          database.data.filename
        );
        if (file.exists) {
          console.log("Found downloaded book.");
          console.log({ file: file.uri });
          setBookUrl(file.uri);
        } else {
          const destination = new Directory(Paths.cache, database.data.id);
          if (!destination.exists) {
            destination.create();
          }

          const storage = await supabase.storage
            .from("books")
            .createSignedUrl(database.data.filename, 3600);
          console.log({ storage });

          if (storage.data) {
            const url = storage.data.signedUrl;
            console.log("Downloading Book...");

            try {
              const output = await File.downloadFileAsync(url, file);
              if (output.exists) {
                console.log("Book downloaded!");
                setBookUrl(output.uri);
              }
            } catch (error) {
              console.error(error);
            }
          } else {
            console.error("Error fetching book from storage:", storage.error);
            setError("Error fetching book.");
          }
        }

        if (database.data.highlights.length > 0) {
          setAnnotations(
            database.data.highlights.map((annotation) => {
              const a: VisualAnnotation = {
                cfiRange: annotation.location,
                data: {
                  id: annotation.id,
                  img_url: annotation.img_url,
                  img_prompt: annotation.img_prompt,
                },
                sectionIndex: 0, // not sure why but Annotation type needs this
                cfiRangeText: annotation.text,
                type: "highlight",
              };
              return a;
            })
          );
        }
      } else {
        console.error(
          "Error fetching book data from database:",
          database.error
        );
        setError("Error fetching book.");
      }

      setLoadingBook(false);
    };

    fetchBook();

    // setBookUrl("https://s3.amazonaws.com/moby-dick/OPS/package.opf");
    // setLoading(false);
  }, [bookId]);

  const handleVisualizeNewHighlight = async (
    cfiRange: string,
    text: string
  ) => {
    setSaveMessage("Visualizing highlight...");
    setShowLoadingModal(true);

    try {
      const newHighlight = await createHighlight(bookId, cfiRange, text, true);

      addAnnotation("highlight", cfiRange, {
        id: newHighlight.id,
        img_url: newHighlight.img_url,
        img_prompt: newHighlight.img_prompt,
      });

      setShowLoadingModal(false);
      return true;
    } catch (error: any) {
      if (error.context?.status === 429) {
        const errData: { status: number; message: string; reset: number } =
          await error.context.json();
        const resetDate = new Date(errData.reset);
        setSaveErrorMessage(
          `${errData.message}\n\nYour quota resets on ${resetDate.toLocaleString()}`
        );
      } else {
        setSaveErrorMessage("Error saving highlight.");
      }
      console.error("Failed to visualize highlight", error);
      setSaveError(true);
    }
  };

  const handleVisualizeExistingHighlight = async (
    annotation: VisualAnnotation
  ) => {
    setSaveMessage("Visualizing highlight...");
    setShowLoadingModal(true);

    try {
      const highlight = await visualizeHighlight(
        annotation.data.id,
        annotation.cfiRangeText,
        bookTitle ?? "Untitled"
      );

      updateAnnotation(annotation, {
        id: annotation.data.id,
        img_url: highlight.img_url,
        img_prompt: highlight.img_prompt,
      });

      annotation.data.img_url = highlight.img_url!;
      annotation.data.img_prompt = highlight.img_prompt!;

      setShowLoadingModal(false);
      setShowEmptyModal(false);

      router.push({
        pathname: "/(protected)/(book)/imageModal",
        params: {
          annotationObj: encodeURIComponent(JSON.stringify(annotation)),
        },
      });

      return true;
    } catch (error: any) {
      if (error.context?.status === 429) {
        const errData: { status: number; message: string; reset: number } =
          await error.context.json();
        const resetDate = new Date(errData.reset);
        setSaveErrorMessage(
          `${errData.message}\n\nYour quota resets on ${resetDate.toLocaleString()}`
        );
      } else {
        setSaveErrorMessage("Error saving highlight.");
      }
      console.error("Failed to visualize highlight", error);
      setSaveError(true);
    }
  };

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

  // Function to handle delete image highlight
  const deleteImageHighlight = async () => {
    setLoadingBook(true);
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
      setLoadingBook(false);
    }
  };

  // Delete highlight with no text from the model
  const handleDeletehighlight = async () => {
    if (selectedHighlight) {
      setLoadingBook(true);
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
        setLoadingBook(false);
        setImageModalVisible(false);
      }
    }
  };

  if (loadingBook) {
    return <Loading message="Loading book..." />;
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
            manager="continuous"
            flow="scrolled"
            onPressAnnotation={(annotation: VisualAnnotation) => {
              setSelectedAnnotation(annotation);

              if (annotation.data.img_url) {
                router.push({
                  pathname: "/(protected)/(book)/imageModal",
                  params: {
                    annotationObj: encodeURIComponent(
                      JSON.stringify(annotation)
                    ),
                  },
                });
              } else {
                setShowEmptyModal(true);
              }
            }}
            initialAnnotations={annotations}
            menuItems={[
              {
                label: "Visualize",
                action: (cfiRange, text) => {
                  handleVisualizeNewHighlight(cfiRange, text);
                  return true;
                },
              },
            ]}
          />
        ) : (
          <Text>Book URL is not available.</Text>
        )}

        <TableOfContents
          ref={tableOfContentsRef}
          onPressSection={(section) => {
            goToLocation(section.href.split("/")[1]);
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

        {/* Empty highlight modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showEmptyModal}
          onRequestClose={() => setShowEmptyModal(!showEmptyModal)}
        >
          <View style={styles.modalContainer}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setShowEmptyModal(false)}
            />

            <View style={styles.modalView}>
              <Text>This highlight has no image.</Text>
              <Pressable
                onPress={() => {
                  handleVisualizeExistingHighlight(selectedAnnotation!);
                }}
              >
                <Text style={styles.closeButtonText}>Visualize</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* Saving highlight spinner */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showLoadingModal}
          onRequestClose={() => setShowLoadingModal(!showLoadingModal)}
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
                      setShowLoadingModal(false);
                      setSaveError(false);
                    }}
                  >
                    <Text style={styles.closeButtonText}>Close</Text>
                  </Pressable>
                </>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </GestureHandlerRootView>
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
    color: "white",
    fontWeight: "bold",
  },
  imageHeaderTrash: {
    position: "absolute",
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
