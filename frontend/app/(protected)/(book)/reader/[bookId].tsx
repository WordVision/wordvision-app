// React / React Native
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { View, Text, useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Third-party Libraries
import { useNavigation } from "@react-navigation/native";
import { useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  useReader,
  Reader,
  Annotation,
  Location
} from "@epubjs-react-native/core";
import { useFileSystem } from "@epubjs-react-native/expo-file-system";
import BottomSheet, { BottomSheetModal } from "@gorhom/bottom-sheet";

// Local components
import Loading from "@/components/Loading";
import { TableOfContents } from "./components/TableOfContents";
import { HighlightsList } from "./components/HighlightsList";
import { ImageVisualizer } from "./components/ImageVisualizer";
import Menu from "./components/Menu";
import NavHeader from "./components/NavHeader";
import ActionBar from "./components/ActionBar";
import LocationSyncMenu from "./components/LocationSyncMenu";

// Utilities & Types
import {
  visualizeHighlight,
  createHighlight,
  deleteVisualization,
} from "@/utilities/backendService";
import { BookSelection, Visualization } from "./types";
import { supabase } from "@/lib/supabase";
import { useBookData } from "./hooks/useBookData";
import { useOnExitScreen } from "@/hooks/useOnExitScreen";
import { useAuth } from "@/utilities/authProvider";

export type VisualAnnotation = Annotation<Visualization>;

export default function BookReaderPage() {

  const { session } = useAuth();
  const { bookId } = useLocalSearchParams<{bookId: string}>();

  const {
    goToLocation,
    addAnnotation,
    updateAnnotation,
    removeSelection,
    removeAnnotationByCfi,
    section,
  } = useReader();

  const navigation = useNavigation();

  const tableOfContentsRef = useRef<BottomSheetModal>(null);
  const highlightsListRef = useRef<BottomSheetModal>(null);
  const imageVisualizerRef = useRef<BottomSheet>(null);

  const colorScheme = useColorScheme();

  const [userId, setUserId] = useState<string>();
  const [selection, setSelection] = useState<BookSelection | undefined>();
  const [deleting, setDeleting] = useState<boolean>(false);
  const [selectedAnnotation, setSelectedAnnotation] = useState<VisualAnnotation>();
  const [imageModalVisible, setImageModalVisible] = useState<boolean>(false);
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [showActionBar, setShowActionBar] = useState<boolean>(false);
  const [visualizeError, setVisualizeError] = useState<string | undefined>();
  const [curLocation, setCurLocation] = useState<Location>();

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

  // Do not show navigation header. We are using a custom one.
  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  // Get user id
  useEffect(() => {
    if (session?.user) {
      setUserId(session.user.id);
    }
  }, [session])

  // Fetch book data
  const bookData = useBookData(userId, bookId);

  // Save location to remote when user stops reading
  useOnExitScreen(useCallback(async () => {
    const location = curLocation?.start.cfi;
    console.log("saving current location to remote: ", location);

    // Update book's current location
    const updateBook = await supabase
      .from("user_books")
      .update({
        last_location: location,
      })
      .match({
        "book_id": bookId,
        "user_id": session?.user?.id,
      })

    // Handle any database errors
    if (updateBook.error) {
      console.error("Failed to save current location to remote: ", updateBook.error);
      throw updateBook.error;
    }
  }, [curLocation, bookId, session?.user]));



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


  if (bookData.fetching) {
    return <Loading message="Loading book..." />;
  }


  if (bookData.error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>{bookData.error}</Text>
      </View>
    );
  }


  return (
    <>
      <StatusBar
        hidden={true}
      />

      <NavHeader
        title={bookData.title!}
        show={showMenu}
        onHide={() => setShowMenu(false)}
      />

      <View style={{ flex: 1 }}>
        {bookData.fileURI ? (
          <Reader
            src={bookData.fileURI}
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
              if (userId) {
                console.log("Saving: ", currentLocation.start.cfi);
                await AsyncStorage.setItem(`${userId}-${bookId}`, currentLocation.start.cfi)
              }
            }}
            initialAnnotations={bookData.initialAnnotations}
            initialLocation={bookData.initialLocation}
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
            console.log(section);
            if (section.href.startsWith("/")) {
              goToLocation(section.href.split("/")[1]);
            }
            else {
              goToLocation(section.href);
            }
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
          show={bookData.locationConflict !== null}
          remoteLocation={bookData.locationConflict?.remote!}
          localLocation={bookData.locationConflict?.local!}
          onNo={() => bookData.resolveLocationConflict()}
          onYes={() => {
            const location = bookData.locationConflict?.remote;
            if (location) {
              console.log(location)
              goToLocation(location);
              bookData.resolveLocationConflict();
            }
          }}
        />

      </View>
    </>
  );
}

