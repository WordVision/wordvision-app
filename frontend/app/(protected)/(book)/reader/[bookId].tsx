import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  useColorScheme,
  AppState,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useReader, Reader, Annotation, Location } from "@epubjs-react-native/core";
import { useFileSystem } from "@epubjs-react-native/expo-file-system";
import { File, Paths, Directory } from "expo-file-system/next";
import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import BottomSheet, { BottomSheetModal } from "@gorhom/bottom-sheet";
import { supabase } from "@/lib/supabase";

import Loading from "@/components/Loading";

import { TableOfContents } from "./components/TableOfContents";
import { HighlightsList } from "./components/HighlightsList";
import { ImageVisualizer } from "./components/ImageVisualizer";
import Menu from "./components/Menu";
import NavHeader from "./components/NavHeader";
import ActionBar from "./components/ActionBar";

import {
  visualizeHighlight,
  createHighlight,
  deleteVisualization,
} from "@/utilities/backendService";
import { BookSelection, Visualization } from "./types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "@supabase/supabase-js";
import LocationSyncMenu from "./components/LocationSyncMenu";

export type VisualAnnotation = Annotation<Visualization>;

export default function BookReaderPage() {

  const {
    goToLocation,
    addAnnotation,
    updateAnnotation,
    removeSelection,
    removeAnnotationByCfi,
    section,
  } = useReader();

  const { bookId } = useLocalSearchParams<{bookId: string}>();

  const navigation = useNavigation();

  const tableOfContentsRef = useRef<BottomSheetModal>(null);
  const highlightsListRef = useRef<BottomSheetModal>(null);
  const imageVisualizerRef = useRef<BottomSheet>(null);

  const colorScheme = useColorScheme();

  const [selection, setSelection] = useState<BookSelection | undefined>();
  const [deleting, setDeleting] = useState<boolean>(false);
  const [annotations, setAnnotations] = useState<VisualAnnotation[]>([]);
  const [selectedAnnotation, setSelectedAnnotation] = useState<VisualAnnotation>();
  const [bookUrl, setBookUrl] = useState<string | null>(null);
  const [loadingBook, setLoadingBook] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageModalVisible, setImageModalVisible] = useState<boolean>(false);
  const [bookTitle, setBookTitle] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [showActionBar, setShowActionBar] = useState<boolean>(false);
  const [visualizeError, setVisualizeError] = useState<string | undefined>();
  const [initialLocation, setInitialLocation] = useState<string>();
  const [showLocationSyncMenu, setShowLocationSyncMenu] = useState<boolean>(false);
  const [lastRemoteLocation, setLastRemoteLocation] = useState<string>();

  const [curLocation, setCurLocation] = useState<Location>();
  const curLocationRef = useRef(curLocation);
  useEffect(() => {
    curLocationRef.current = curLocation;
  }, [curLocation]);

  const [user, setUser] = useState<User>();
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);


  const theme = useMemo(() => ({
    'body': {
      background: '#000',
    },
    'span': {
      color: '#fff !important',
    },
    'p': {
      color: '#fff !important',
      "text-align": "start !important",
      "font-size": "1.2rem !important",
      "line-height": "1.5 !important"
    },
    'li': {
      color: '#fff !important',
    },
    'h1': {
      color: '#fff !important',
    },
    'a': {
      'color': '#fff !important',
      'pointer-events': 'auto',
      'cursor': 'pointer',
    },
    '::selection': {
      background: 'lightskyblue',
    },
  }), []);


  // Navigation options as a stack child
  useEffect(() => {
    navigation.setOptions({
      title: "Reader",
      headerShown: false,
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


  // Fetch user and book data
  useEffect(() => {

    if (!bookId) {
      setError("No bookId provided");
      setLoadingBook(false);
      return;
    }

    const fetchBook = async () => {
      setLoadingBook(true);

      // fetch user details
      const { data: { user }} = await supabase.auth.getUser();
      if (!user) {
        setError("Error fetching user details.");
        setLoadingBook(false);
        return;
      }
      setUser(user);

      // Get book details with regards to user
      const { data: bookData, error: bookDataError } = await supabase
        .from("user_books")
        .select(
          `
          last_location,
          books(
            id,
            filename,
            title,
            highlights(
              id,
              text,
              location,
              img_url,
              img_prompt,
              chapter
            )
          )
        `
        )
        .match({
          "book_id": bookId,
          "user_id": user.id,
        })
        .limit(1)
        .single();


      if (bookData) {
        setBookTitle(bookData.books.title);

        // Create file path {user id}-{book file name}
        const file = new File(
          Paths.cache,
          user.id,
          bookData.books.filename.split("/").pop()!
        );

        if (file.exists) {
          // Get the book file
          console.log("Found downloaded book.");
          console.log({ file: file.uri });
          setBookUrl(file.uri);
        }
        else {
          // Download book file to path
          const destination = new Directory(Paths.cache, user.id);
          if (!destination.exists) {
            destination.create();
          }

          const storage = await supabase.storage
            .from("books")
            .createSignedUrl(bookData.books.filename, 3600);
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
          }
          else {
            console.error("Error fetching book from storage:", storage.error);
            setError("Error fetching book.");
          }
        }

        // Set the book rendition annotations
        if (bookData.books.highlights.length > 0) {
          setAnnotations(
            bookData.books.highlights.map((data) => {
              const a: VisualAnnotation = {
                cfiRange: data.location,
                data: {
                  id: data.id,
                  text: data.text,
                  location: data.location,
                  img_url: data.img_url,
                  img_prompt: data.img_prompt,
                  chapter: data.chapter,
                },
                sectionIndex: 0, // not sure why but Annotation type needs this
                cfiRangeText: data.text,
                type: "highlight",
              };
              return a;
            })
          );
        }

        // Set initial book location
        const key = `${user.id}-${bookId}`;
        try {
          const remoteLocation = bookData.last_location;
          const localLocation = await AsyncStorage.getItem(key);
          console.log({remoteLocation, localLocation});

          if (localLocation !== null) {
            setInitialLocation(localLocation);
            setLastRemoteLocation(remoteLocation || undefined);

            if (remoteLocation !== localLocation) {
              console.log("remoteLocation is not equal to localLocation")
              console.log("must prompt user to choose between locations");
              setShowLocationSyncMenu(true);
            }
          }
          else if (remoteLocation !== null) {
            console.error("No local location found. Automatically using remote location");
            setInitialLocation(remoteLocation);
          }
          else {
            console.warn("no local or remote locations found");
          }
        }
        catch (e) {
          console.error(`error reading location value with key: ${key}`)
          return;
        }

      }
      else {
        console.error("Error fetching book data from database:", bookDataError);
        setError("Error fetching book.");
      }

      setLoadingBook(false);
    };

    fetchBook();

    // setBookUrl("https://s3.amazonaws.com/moby-dick/OPS/package.opf");
    // setLoading(false);
  }, [bookId]);


  // Setup listener to save location to remote when user stops reading
  useEffect(() => {

    const saveLocationToRemote = async () => {
      const location = curLocationRef.current?.start.cfi;
      console.log("saving current location to remote: ", location);

      // Update book's current location
      const updateBook = await supabase
        .from("user_books")
        .update({
          last_location: location,
        })
        .match({
          "book_id": bookId,
          "user_id": userRef.current?.id,
        })

      // Handle any database errors
      if (updateBook.error) {
        console.error("Failed to save current location to remote: ", updateBook.error);
        throw updateBook.error;
      }
    };

    // When the screen loses focus (e.g., user navigates away)
    const unsubscribeBeforeRemove = navigation.addListener('beforeRemove', () => {
      saveLocationToRemote();
    });

    // When user closes or backgrounds the app
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState.match(/inactive|background/)) {
        saveLocationToRemote();
      }
    });

    // Cleanup listeners on unmount
    return () => {
      unsubscribeBeforeRemove();
      subscription.remove();
    };
  }, [navigation]);


  const handleVisualizeNewHighlight = async (
    cfiRange: string,
    text: string,
    chapter: string,
  ) => {
    try {
      const newHighlight = await createHighlight(
        bookId,
        cfiRange,
        text,
        chapter,
        true
      );

      addAnnotation("highlight", cfiRange, {
        id: newHighlight.id,
        text: newHighlight.text,
        location: newHighlight.location,
        img_url: newHighlight.img_url,
        img_prompt: newHighlight.img_prompt,
        chapter: newHighlight.chapter,
      });

      setSelectedAnnotation({
        type: "highlight",
        cfiRange: newHighlight.location,
        cfiRangeText: newHighlight.text,
        data: {
          id: newHighlight.id,
          text: newHighlight.text,
          location: newHighlight.location,
          img_url: newHighlight.img_url,
          img_prompt: newHighlight.img_prompt,
          chapter: newHighlight.chapter,
        },
        sectionIndex: 0,
      })

    }
    catch (error: any) {
      if (error.context?.status === 429) {
        const errData: {
          status: number;
          message: string;
          reset: number
        } = await error.context.json();
        const resetDate = new Date(errData.reset);
        setVisualizeError(`${errData.message}\n\nYour quota resets on ${resetDate.toLocaleString()}`);
      }
      else {
        setVisualizeError("Error saving highlight.");
      }
      console.error("Failed to visualize highlight", error);
    }
  };



  const handleVisualizeExistingHighlight = async (
    annotation: VisualAnnotation
  ) => {
    try {
      const highlight = await visualizeHighlight(
        annotation.data.id,
        annotation.cfiRangeText,
        annotation.data.chapter ?? null
      );

      const newData: Visualization = {
        id: annotation.data.id,
        text: annotation.data.text,
        location: annotation.data.location,
        img_url: highlight.img_url,
        img_prompt: highlight.img_prompt,
        chapter: annotation.data.chapter,
      }

      updateAnnotation(annotation, newData);
      annotation.data = newData;
      setSelectedAnnotation(annotation);

    }
    catch (error: any) {
      if (error.context?.status === 429) {
        const errData: {
          status: number;
          message: string;
          reset: number
        } = await error.context.json();
        const resetDate = new Date(errData.reset);
        setVisualizeError(`${errData.message}\n\nYour quota resets on ${resetDate.toLocaleString()}`);
      }
      else {
        setVisualizeError("Error saving highlight.");
      }
      console.error("Failed to visualize highlight", error);
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
  // const deleteImageHighlight = async () => {
  //   setLoadingBook(true);
  //   setError(null);
  //
  //   try {
  //     const response = await fetch(
  //       `http://localhost:8000/book/${bookId}/highlight/${highlightId}/image`,
  //       {
  //         method: "DELETE",
  //         headers: {
  //           Authorization: `Bearer ${user.accessToken}`,
  //         },
  //       }
  //     );
  //
  //     if (response.ok) {
  //       setHighlights((prevHighlights) =>
  //         prevHighlights.map((item) =>
  //           item.id === highlightId ? { ...item, imgUrl: undefined } : item
  //         )
  //       );
  //       setImageModalVisible(false);
  //     } else {
  //       const errorData = await response.json();
  //       setError(`Error removing image: ${errorData.message}`);
  //     }
  //   } catch (err) {
  //     console.log(`Exception while calling the delete API: ${err}.`);
  //     setError("Error removing image.");
  //   } finally {
  //     setLoadingBook(false);
  //   }
  // };

  // Delete highlight with no text from the model
  // const handleDeletehighlight = async () => {
  //   if (selectedHighlight) {
  //     setLoadingBook(true);
  //     setError(null);
  //
  //     try {
  //       // Call the delete API
  //       await deleteHighlight(user, bookId, selectedHighlight.id);
  //
  //       // Remove the selected highlight from the list
  //       setHighlights((prevHighlights) =>
  //         prevHighlights.filter((item) => item.id !== selectedHighlight.id)
  //       );
  //
  //       // Optionally clear the selectedHighlight
  //       setSelectedHighlight(null);
  //     } catch (err) {
  //       console.log(`Exception while calling the delete API: ${err}.`);
  //       setError("Error removing image.");
  //     } finally {
  //       setLoadingBook(false);
  //       setImageModalVisible(false);
  //     }
  //   }
  // };

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
    <>
      <StatusBar
        translucent={false}
      />

      <NavHeader
        title={bookTitle!}
        show={showMenu}
        onHide={() => setShowMenu(false)}
      />

      <View style={{ flex: 1 }}>
        {bookUrl ? (
          <Reader
            src={bookUrl}
            fileSystem={useFileSystem}
            waitForLocationsReady
            manager="continuous"
            flow="scrolled"
            defaultTheme={theme}
            onSingleTap={() => {
              if (!showActionBar && !imageModalVisible) {
                setShowMenu(!showMenu);
              }
              setShowActionBar(false);
            }}
            onPressAnnotation={(annotation: VisualAnnotation) => {
              setShowMenu(false);
              setImageModalVisible(true)

              setSelectedAnnotation(annotation);
              imageVisualizerRef.current?.expand()
            }}
            onSelected={(selectedText, cfiRange) => {
              console.log("onSelected")
              setShowMenu(false);
              setShowActionBar(true);
              setSelection({
                text: selectedText,
                location: cfiRange,
              });
            }}
            onLocationChange={async (totalLocations, currentLocation, progress, currentSection) => {
              console.log(currentLocation);
              setCurLocation(currentLocation);
              if (user) {
                console.log("Saving: ", currentLocation.start.cfi);
                await AsyncStorage.setItem(`${user.id}-${bookId}`, currentLocation.start.cfi)
              }
            }}
            initialAnnotations={annotations}
            initialLocation={initialLocation}
            menuItems={[]}
          />
        ) : (
          <Text>Book URL is not available.</Text>
        )}

        <Menu
          show={showMenu}
          menuItemDataList={[
            {
              label: "Table of Contents",
              iconName: "unordered-list",
              onPress: () => {
                setShowMenu(false);
                tableOfContentsRef.current?.present()
              }
            },
            {
              label: "Highlights",
              iconName: "sparkling",
              onPress: () => {
                setShowMenu(false);
                highlightsListRef.current?.present();
              }
            },
          ]}
        />

        <ActionBar
          show={showActionBar}
          onVisualize={async () => {
            setShowActionBar(false);
            removeSelection();
            if (selection) {
              imageVisualizerRef.current?.expand()
              await handleVisualizeNewHighlight(selection.location, selection.text, section?.label || "");;
            }
          }}
        />

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

        <ImageVisualizer
          ref={imageVisualizerRef}
          visualization={selectedAnnotation?.data}
          error={visualizeError}
          deleting={deleting}
          onClose={() => {
            setSelectedAnnotation(undefined);
            setVisualizeError(undefined);
            setImageModalVisible(false);
            imageVisualizerRef.current?.close();
          }}
          onDelete={async (v: Visualization) => {
            setDeleting(true);

            const { error } = await deleteVisualization(v);
            if (!error) {
              removeAnnotationByCfi(v.location);
              setSelectedAnnotation(undefined);
              setVisualizeError(undefined);
              setImageModalVisible(false);
              imageVisualizerRef.current?.close();
            }
            else {
              setVisualizeError(error.message);
            }

            setDeleting(false);
          }}
          onVisualizeEmptyHighlight={async () => {

            if (selectedAnnotation) {
              setSelectedAnnotation(undefined);
              setVisualizeError(undefined);
              await handleVisualizeExistingHighlight(selectedAnnotation)
            }
          }}
        />

        <LocationSyncMenu
          show={showLocationSyncMenu}
          remoteLocation={lastRemoteLocation!}
          localLocation={initialLocation!}

          onClose={() => setShowLocationSyncMenu(false)}
          onNo={() => {
            setShowLocationSyncMenu(false);
          }}
          onYes={() => {
            if (lastRemoteLocation) {
              console.log(lastRemoteLocation)
              goToLocation(lastRemoteLocation);
              setShowLocationSyncMenu(false);
            }
          }}
        />

      </View>
    </>
  );
}

