import React, { useContext, useState, useEffect, useRef, useMemo } from "react";
import {
  Modal,
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Image,
  Switch,
  TextInput,
  Pressable,
  Button,
} from "react-native";
import { ReactReader } from "react-reader";
import { useRoute } from "@react-navigation/native";
import type { Rendition, Contents } from "epubjs";
import Section from "epubjs/types/section";
import Icon from "react-native-vector-icons/FontAwesome";
import Feather from "react-native-vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";

import { AuthContext, type User } from "@/utilities/authContext";
import {
  type Highlight,
  type Selection,
  generateHighlightImage,
  regenerateHighlightImage,
  fetchUpdatedHighlight,
  getAllHighlightsByBookId,
  getBookByBookId,
  createCustomImage,
  createUserHighlight,
  deleteHighlight,
  updateBookSettings,
  getBookSettings,
  visualizeHighlight,
} from "@/utilities/backendService";
import Loading from "@/components/Loading";
import { HighlightContext } from "@/utilities/highlightContext";

import { useAuth } from "@/utilities/authProvider";
import { useReader, Reader, Annotation } from "@epubjs-react-native/core";
import { useFileSystem } from '@epubjs-react-native/expo-file-system';
import { supabase } from "@/lib/supabase";

import { File, Paths, Directory } from 'expo-file-system/next';
import { Link, useLocalSearchParams } from "expo-router";

import { Entypo } from '@expo/vector-icons';

import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetFlatList,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function BookReaderPage() {
  const user = useContext(AuthContext) as User;


  const {
    theme,
    changeFontSize,
    changeFontFamily,
    changeTheme,
    goToLocation,
    addAnnotation,
    removeAnnotation,
    toc,
    section,
  } = useReader();

  const [ selectedAnnotation, setSelectedAnnotation ] = useState<Annotation | null>(null);
  const [ annotations, setAnnotations ] = useState<Annotation[]>([]);

  const { highlights, setHighlights } = useContext(HighlightContext);

  // const ctxMenuRef = useRef<any>(null);

  // const route = useRoute();
  //
  // const { bookId, userHighlight } = route.params as {
  //   bookId: string;
  //   userHighlight: Highlight;
  // };



  // const [location, setLocation] = useState<string | number>(0);

  const [bookUrl, setBookUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const [custompromptModelVisible, setCustomPromptModelVisible] = useState<boolean>(false);
  const [imageModalVisible, setImageModalVisible] = useState<boolean>(false);
  const [saveError, setSaveError] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string>("Saving highlight...");
  const [saveErrorMessage, setSaveErrorMessage] = useState<string>(
    "Error saving highlight."
  );
  const [selectedHighlight, setSelectedHighlight] = useState<Highlight | null>(
    null
  );
  const [inputText, setInputText] = useState<string>();
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
  }>({ visible: false, x: 0, y: 0 });
  const [selection, setSelection] = useState<Selection | null>(null);
  const [rendition, setRendition] = useState<Rendition | undefined>(undefined);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    null
  );
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [isDarkMode, setIsDarkMode] = useState(false);
  // const imageURL = selectedHighlight?.imgUrl;
  // const highlightId = imageURL?.split("/").pop()?.replace(".png", "");

  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const navigation = useNavigation();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['70%', '100%'], []);


  // Navigation options as a stack child
  useEffect(() => {
    navigation.setOptions({
      title: "Reader",
      headerShown: true,
      headerRight: () => (
        <Pressable
          style={({pressed}) => {
            return {
              opacity: pressed ? 0.3 : 1
            }
          }}
          onPress={() => bottomSheetRef.current?.present()}
        >
          <Entypo name="list" size={24} color="white" />
        </Pressable>
      ),
    });
  }, [navigation]);


  // Fetch book data and settings
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
            text,
            location,
            img_url
          )
        `)
        .eq("id", bookId)
        .limit(1)
        .single()

      console.log(database.data);

      if (database.data) {

        const storage = await supabase.storage.from("books").createSignedUrl(database.data.filename, 3600)
        console.log(storage)

        if (storage.data) {
          const url = storage.data.signedUrl;
          const destination = new Directory(Paths.cache, database.data.id);

          try {
            if (!destination.exists) {
              destination.create();
            }

            const file = new File(Paths.cache, database.data.id, database.data.filename);

            if (!file.exists) {
              console.log("Downloading Book...")
              const output = await File.downloadFileAsync(url, destination);
              if (output.exists) console.log("Book downloaded!")
            }
            else {
              console.log("Found downloaded book.")
            }

            console.log(file.uri);
            setBookUrl(file.uri);
          }
          catch (error) {
            console.error(error);
          }
        }
        else {
          console.error("Error fetching book from storage:", storage.error);
          setError("Error fetching book.");
        }

        if (database.data.highlights.length > 0) {
          setAnnotations(database.data.highlights.map(annotation => {
            return {
              cfiRange: annotation.location,
              data: {
                img_url: annotation.img_url
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

    // const fetchSettings = async () => {
    //   try {
    //     const response = await getBookSettings(user, bookId);
    //     if (response) {
    //       const parsedFontSize = parseInt(
    //         response.font_size.replace("px", ""),
    //         10
    //       );
    //       setFontSize(parsedFontSize);
    //       setIsDarkMode(response.dark_mode || false);
    //     }
    //   } catch (err) {
    //     console.error("Error fetching book settings:", err);
    //   }
    // };

    fetchBook();
    // fetchSettings();
  }, [bookId, user]);

  // useEffect(() => {
  //   if (rendition) {
  //     // Apply settings to rendition only once after it's initialized
  //     rendition.themes.fontSize(`${fontSize}px`);
  //     rendition.themes.register("custom", {
  //       "html, body": {
  //         color: isDarkMode ? "#FFFFFF" : "#000000",
  //         background: isDarkMode ? "#000000" : "#FFFFFF",
  //       },
  //     });
  //     rendition.themes.select("custom");
  //   }
  // }, [rendition, fontSize, isDarkMode]);

  // Adding highlights
  // useEffect(() => {
  //   if (highlights && rendition) {
  //     highlights.forEach((highlight) => {
  //       rendition.annotations.add(
  //         "highlight",
  //         highlight.location,
  //         {},
  //         () => handleHighlightClick(highlight),
  //         "hl",
  //         {
  //           fill: "red",
  //           "fill-opacity": "0.5",
  //           "mix-blend-mode": "multiply",
  //         }
  //       );
  //     });
  //
  //     function setContextMenuHandler(_: Section, view: any) {
  //       const iframe = view.iframe as HTMLIFrameElement | null;
  //       const iframeDoc = iframe?.contentDocument;
  //       const iframeWindow = iframe?.contentWindow;
  //
  //       if (iframeDoc && iframeWindow) {
  //         function contextMenuHandler(event: MouseEvent) {
  //           event.preventDefault();
  //           const textSelection = iframeWindow?.getSelection();
  //           if (textSelection && textSelection.toString().length > 0) {
  //             const x = event.screenX - window.screenX + 5;
  //             const y = event.screenY - window.screenY - 275;
  //             setContextMenu({ visible: true, x, y });
  //           }
  //         }
  //
  //         function dismissMenuHandler(e: MouseEvent) {
  //           const menu = ctxMenuRef.current as HTMLElement;
  //           if (menu && !menu.contains(e.target as Node) && e.button === 0) {
  //             setContextMenu({ visible: false, x: 0, y: 0 });
  //           }
  //         }
  //
  //         iframeDoc.addEventListener("contextmenu", contextMenuHandler);
  //         iframeDoc.addEventListener("mousedown", dismissMenuHandler);
  //       } else {
  //         console.error("Unable to find epubjs iframe");
  //       }
  //     }
  //
  //     function setRenderSelection(cfiRange: string, _: Contents) {
  //       if (rendition) {
  //         const selection: Selection = {
  //           text: rendition.getRange(cfiRange).toString(),
  //           location: cfiRange,
  //         };
  //         setSelection(selection);
  //       }
  //     }
  //
  //     rendition.on("rendered", setContextMenuHandler);
  //     rendition.on("selected", setRenderSelection);
  //
  //     return () => {
  //       rendition?.off("rendered", setContextMenuHandler);
  //       rendition?.off("selected", setRenderSelection);
  //     };
  //   }
  // }, [setSelection, rendition]);

  const handleRegenerate = async () => {
    if (!selectedHighlight || !selectedHighlight.imgUrl) return;

    try {
      const imgUrl = selectedHighlight.imgUrl;
      const highlightId = imgUrl.split("/").pop()?.replace(".png", "");

      if (!highlightId) {
        console.error("Unable to extract highlight ID from imgUrl:", imgUrl);
        return;
      }

      setModalVisible(true);

      const putSuccess = await regenerateHighlightImage(
        user,
        bookId,
        highlightId
      );

      if (putSuccess) {
        const updatedHighlight = await fetchUpdatedHighlight(
          user,
          bookId,
          highlightId
        );

        const timestampedUrl = `${updatedHighlight.imgUrl}?t=${new Date().getTime()}`;

        setHighlights(
          highlights.map((h) =>
            h.location === selectedHighlight?.location
              ? { ...h, imgUrl: timestampedUrl }
              : h
          )
        );
        setSelectedHighlight({ ...updatedHighlight, imgUrl: timestampedUrl });
      }
    } catch (error) {

      console.error(
        "Error in regenerating image or fetching updated highlight:",
        error
      );

    } finally {
      setModalVisible(false);
    }
  };

  const handleGenerateNewImage = async (highlight: Selection) => {
    if (!highlight || !highlight.text || !highlight.id) {
      console.error("Invalid highlight selected for image generation");
      return;
    }

    try {
      // Show the loading modal
      setSaveMessage("Generating image...");
      setModalVisible(true);

      // Generate the new image using the backend service
      const newImageUrl = await generateHighlightImage(user, bookId, highlight.id);

      // Update the highlights array with the new image URL
      setHighlights((prevHighlights) =>
        prevHighlights.map((h) =>
          h.id === highlight.id ? { ...h, imgUrl: newImageUrl } : h
        )
      );

      // Update the selected highlight if it matches the generated one
      setSelectedHighlight((prev) => {
        if (prev && prev.id === highlight.id) {
          return {
            ...prev,
            imgUrl: newImageUrl,
          }
        }
        return prev;
      });

      console.log("Image successfully generated:", newImageUrl);
    } catch (error) {
      console.error("Error while generating new image:", error);
      setSaveError(true);
    } finally {
      // Hide the loading modal
      setModalVisible(false);
    }
  };
  //
  //
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

  // const handleRenderImage = async () => {
  //   if (rendition && selection) {
  //     setSaveMessage("Visualizing highlight...");
  //     setModalVisible(true);
  //
  //     try {
  //       const url = `http://localhost:8000/book/${bookId}/highlight?image=true`;
  //       const response = await fetch(url, {
  //         method: "POST",
  //         body: JSON.stringify(selection),
  //         headers: user.authorizationHeaders(),
  //       });
  //
  //       if (response.ok) {
  //         const data = await response.json();
  //         const highlight = { ...selection, imgUrl: data.imgUrl, id: data.highlightId };
  //
  //         setGeneratedImageUrl(data.imgUrl || null);
  //         setHighlights([...highlights, { ...selection, imgUrl: data.imgUrl, id: data.highlightId }]);
  //
  //         rendition.annotations.add(
  //           "highlight",
  //           highlight.location,
  //           {},
  //           () => handleHighlightClick(highlight),
  //           "hl",
  //           {
  //             fill: "red",
  //             "fill-opacity": "0.5",
  //             "mix-blend-mode": "multiply",
  //           }
  //         );
  //
  //         // @ts-ignore: DO NOT REMOVE THIS COMMENT
  //         // This annotation was added because typescript throws an error
  //         //   for getContents()[0]
  //         // The return type for getContents() is outdated and actually returns
  //         //   Contents[] instead of Contents
  //         rendition.getContents()[0]?.window?.getSelection()?.removeAllRanges();
  //       }
  //       else {
  //         console.error("Failed to visualize highlight", response);
  //         setSaveError(true);
  //       }
  //     } catch (error) {
  //       console.error("Failed to visualize highlight", error);
  //       setSaveError(true);
  //     } finally {
  //       setModalVisible(false);
  //     }
  //   }
  //   setContextMenu({ visible: false, x: 0, y: 0 });
  // };
  //
  // const handleHighlightClick = (highlight: Highlight) => {
  //   setSelectedHighlight(highlight);
  //   setImageModalVisible(true);
  // };
  //
  // const applySettings = () => {
  //   if (rendition) {
  //     rendition.themes.fontSize(`${fontSize}px`);
  //     rendition.themes.register("custom", {
  //       "html, body": {
  //         color: isDarkMode ? "#FFFFFF" : "#000000",
  //         background: isDarkMode ? "#000000" : "#FFFFFF",
  //       },
  //     });
  //     rendition.themes.select("custom");
  //   }
  //
  //   const saveSettings = async () => {
  //     try {
  //       const payload = {
  //         font_size: `${fontSize}px`, // Ensure it's a string with "px"
  //         dark_mode: isDarkMode,
  //       };
  //       await updateBookSettings(user, bookId, payload);
  //       console.log("Settings saved successfully:", payload);
  //     } catch (err) {
  //       console.error("Error saving book settings:", err);
  //     }
  //   };
  //
  //   saveSettings();
  //
  //   setSettingsModalVisible(false);
  // };

  //handle edit icon for custom text image generation
  // const handleCustomImagePrompt = async () => {
  //   setSaveMessage("Visualizing highlight...");
  //   setModalVisible(true);
  //
  //   if (inputText) {
  //     try {
  //       const imgUrl = selectedHighlight?.imgUrl;
  //       const highlightId = imgUrl?.split("/").pop()?.replace(".png", "") || "";
  //
  //       const response = await createCustomImage(
  //         user,
  //         bookId,
  //         highlightId,
  //         inputText
  //       );
  //
  //       if (response) {
  //         const updatedHighlight = await fetchUpdatedHighlight(
  //           user,
  //           bookId,
  //           highlightId
  //         );
  //         const timestampedUrl = `${updatedHighlight.imgUrl}?t=${new Date().getTime()}`;
  //
  //         setHighlights(
  //           highlights.map((h) =>
  //             h.location === selectedHighlight?.location
  //               ? { ...h, imgUrl: timestampedUrl }
  //               : h
  //           )
  //         );
  //         setSelectedHighlight({ ...updatedHighlight, imgUrl: timestampedUrl });
  //       }
  //     } catch (error) {
  //       console.error(
  //         "Error in regenerating image or fetching updated highlight:",
  //         error
  //       );
  //     } finally {
  //       setModalVisible(false);
  //     }
  //   }
  // }

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

  // const handleBack = () => {
  //   navigation.navigate("bookDetails", { bookId });
  // };

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

        {/*
        <ReactReader
          url={bookUrl}
          epubInitOptions={{ openAs: "epub" }}
          location={location}
          locationChanged={(epubcfi: string) => setLocation(epubcfi)}
          getRendition={(rendition: Rendition) => {
            setRendition(rendition);
            // Apply settings on book render
            rendition.themes.fontSize(`${fontSize}px`);
            rendition.themes.register("custom", {
              "html, body": {
                color: isDarkMode ? "#FFFFFF" : "#000000",
                background: isDarkMode ? "#000000" : "#FFFFFF",
              },
            });
            rendition.themes.select("custom");
          }}
        />
*/}

      {bookUrl ? (
        <Reader
          src={bookUrl}
          fileSystem={useFileSystem}
          waitForLocationsReady
          onSelected={(selection, cfiRange) => {
            setSelection({text: selection, location: cfiRange});
          }}
          onPressAnnotation={(annotation) => {
            setSelectedAnnotation(annotation);
            setImageModalVisible(true);
          }}


          initialAnnotations={annotations}
          menuItems={[
            {
              label: 'Visualize',
              action: (cfiRange, text) => {

                setSaveMessage("Visualizing highlight...");
                setModalVisible(true);

                supabase.functions.invoke('highlight', {
                  body: {
                    book_id: bookId,
                    text: text,
                    location: cfiRange,
                    visualize: true,
                  },
                }).then(({data, error}) => {

                  console.log({data})

                    if (data) {

                      addAnnotation(
                        'highlight',
                        cfiRange,
                        {
                          imgUrl: data.img_Url
                        },
                        {
                          color: "#C20114",
                        }
                      );

                      // const highlight = { ...selection, imgUrl: data.imgUrl, id: data.highlightId };

                      // setGeneratedImageUrl(data.imgUrl || null);
                      // setHighlights([...highlights, { ...selection, imgUrl: data.imgUrl, id: data.highlightId }]);
                      setModalVisible(false);
                      return true;
                    }
                    else {
                      console.error("Failed to visualize highlight");
                      setSaveError(true);
                      return false;
                    }

                });

                return true;
              }
            },
          ]}
        />
      ) : (
        <Text>Book URL is not available.</Text>
      )}

      {/*
          onDismiss={() => setSearchTerm('')}
*/}

      <BottomSheetModalProvider>
        <BottomSheetModal
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          enablePanDownToClose
          style={{
            ...styles.container,
            backgroundColor: theme.body.background,
          }}
          handleStyle={{ backgroundColor: theme.body.background }}
          backgroundStyle={{ backgroundColor: theme.body.background }}
        >
          <BottomSheetFlatList
            data={toc}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                key={item.id}
                style={({pressed}) => ({
                  backgroundColor: pressed ? "#fff" : "#dbdbdb",
                  marginVertical: 2,
                  marginHorizontal: 24,
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 5
                })}
                onPress={() => {
                  goToLocation(item.href.split('/')[1])
                  bottomSheetRef.current?.dismiss();
                }}
              >
                <View>
                  <Text
                    style={{
                      color: section?.id === item.id
                        ? "red"
                        : "black",
                    }}
                  >
                    {item.label}
                  </Text>
                </View>
              </Pressable>
            )}
            ListHeaderComponent={
              <View style={{
                width: '100%',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginVertical: 10,
                paddingHorizontal: 24
              }}>
                <Text style={{
                  fontSize: 24
                }}>
                  Table of Contents
                </Text>

                <Pressable onPress={() => {bottomSheetRef.current?.dismiss()}}>
                  <Text style={{
                    fontSize: 16
                  }}>Close</Text>
                </Pressable>
              </View>
            }
            style={{ width: '100%' }}
            maxToRenderPerBatch={20}
          />
        </BottomSheetModal>
      </BottomSheetModalProvider>

      {/*
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => setSettingsModalVisible(true)}
      >
        <Icon name="cog" size={24} color="white" />
      </TouchableOpacity>
*/}

      {/*

      {contextMenu.visible && (
        <View
          style={[
            styles.contextMenu,
            { top: contextMenu.y, left: contextMenu.x },
          ]}
          ref={ctxMenuRef}
        >
          <TouchableOpacity
            style={styles.contextMenuItem}
            onPress={handleHighlight}
          >
            <Text>Highlight</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.contextMenuItem}
            onPress={handleRenderImage}
          >
            <Text>Visualize</Text>
          </TouchableOpacity>
        </View>
      )}
*/}

      {/*
      <Modal
        animationType="slide"
        transparent={true}
        visible={settingsModalVisible}
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text>Dark Mode</Text>
            <Switch
              value={isDarkMode}
              onValueChange={(value) => setIsDarkMode(value)}
            />
            <Text>Font Size</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(fontSize)}
              onChangeText={(value) => setFontSize(parseFloat(value) || 16)}
            />
            <TouchableOpacity onPress={applySettings}>
              <Text style={styles.closeButtonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
*/}

      <Modal
        animationType="slide"
        transparent={true}
        visible={imageModalVisible}
        onRequestClose={() => setImageModalVisible(false)}
      >

      {/*
            {selectedHighlight?.imgUrl ? (

                <Image
                  source={{ uri: selectedHighlight?.imgUrl }}
                  style={{ width: 425, height: 425 }}
                  resizeMode="contain"
                />
      */}

        <View style={styles.modalContainer}>
          <View style={styles.imageModalView}>
            {selectedAnnotation?.data?.img_url ? (
              <>
                <View style={styles.imageHeader}>
                  <Text style={{ fontSize: 20 }}>Generated image:</Text>
                  <TouchableOpacity onPress={handleRegenerate}>
                    <Icon
                      name="refresh"
                      size={19}
                      color="#000000"
                      style={styles.refreshIcon}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setCustomPromptModelVisible(true)}
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

      {/* Model for custom text prompt
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
              placeholder={selectedHighlight?.text}
              onChangeText={setInputText}
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
*/}

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
  modalView: {
    width: 350,
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
  },
  textInput: {
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

