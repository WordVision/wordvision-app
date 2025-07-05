import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  useColorScheme,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useReader, Reader, Annotation } from "@epubjs-react-native/core";
import { useFileSystem } from "@epubjs-react-native/expo-file-system";
import { File, Paths, Directory } from "expo-file-system/next";
import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { FontAwesome5 } from "@expo/vector-icons";
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
  type Highlight,
  // deleteHighlight,
  visualizeHighlight,
  createHighlight,
  deleteVisualization,
} from "@/utilities/backendService";
import { BookSelection, Visualization } from "./types";

export type VisualAnnotation = Annotation<Visualization>;

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
          id, filename, title,
          highlights(
            id,
            text,
            location,
            img_url,
            img_prompt,
            chapter
          )
        `
        )
        .eq("id", bookId)
        .limit(1)
        .single();

      console.log({ databaseData: database.data });

      if (database.data) {

        setBookTitle(database.data.title);

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
                  chapter: annotation.chapter,
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
            initialAnnotations={annotations}
            menuItems={[]}
            // menuItems={[
            //   {
            //     label: "Visualize",
            //     action: (cfiRange, text) => {
            //       handleVisualizeNewHighlight(cfiRange, text, section?.label || "");
            //       return true;
            //     },
            //   },
            // ]}
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
      </View>
    </>
  );
}

