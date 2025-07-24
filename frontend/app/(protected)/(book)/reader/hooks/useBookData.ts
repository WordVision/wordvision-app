// React / React Native
import { useState, useEffect } from "react";

// Third-party Libraries
import { File, Paths, Directory } from "expo-file-system/next";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Utilities & Types
import { Annotation } from "@epubjs-react-native/core";
import { Visualization } from "../types";
import { supabase } from "@/lib/supabase";

export type VisualAnnotation = Annotation<Visualization>;

export function useBookData(userId: string | undefined, bookId: string) {

  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [fileURI, setFileURI] = useState<string | null>(null);
  const [initialAnnotations, setInitialAnnotations] = useState<VisualAnnotation[]>([]);
  const [initialLocation, setInitialLocation] = useState<string>()
  const [locationConflict, setLocationConflict] = useState<{local: string; remote: string} | null>(null);

  useEffect(() => {
    if (!userId) {
      return;
    }

    (async () => {
      setFetching(true);

      // Get book details
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
          "user_id": userId,
        })
        .limit(1)
        .single();

      if (bookData) {
        setTitle(bookData.books.title);

        // Create file path {user id}-{book file name}
        const file = new File(
          Paths.cache,
          userId,
          bookData.books.filename.split("/").pop()!
        );

        if (file.exists) {
          // Get the book file
          console.log("Found downloaded book.");
          console.log({ file: file.uri });
          setFileURI(file.uri);
        }
        else {
          // Download book file to path
          const destination = new Directory(Paths.cache, userId);
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
                setFileURI(output.uri);
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
          setInitialAnnotations(
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
        const key = `${userId}-${bookId}`;
        try {
          const remoteLocation = bookData.last_location;
          const localLocation = await AsyncStorage.getItem(key);

          console.log({remoteLocation, localLocation});

          if (localLocation) {
            setInitialLocation(localLocation);

            if (remoteLocation && remoteLocation !== localLocation) {
              console.log("remoteLocation is not equal to localLocation")
              console.log("must prompt user to choose between locations");
              setLocationConflict({
                local: localLocation,
                remote: remoteLocation,
              });
            }
          }
          else if (remoteLocation) {
            console.error("No local location found. Automatically using remote location");
            setInitialLocation(remoteLocation);
          }
          else {
            console.warn("no local or remote locations found");
          }
        }
        catch (e) {
          console.error(`error reading location value with key: ${key}`)
          setError("Error reading book location");
        }

      }
      else {
        console.error("Error fetching book data from database:", bookDataError);
        setError("Error fetching book.");
      }

      // setBookUrl("https://s3.amazonaws.com/moby-dick/OPS/package.opf");

      setFetching(false);
    })();

  }, [userId]);

  return {
    fetching,
    error,
    title,
    fileURI,
    initialAnnotations,
    initialLocation,
    locationConflict,
    resolveLocationConflict: () => {
      setLocationConflict(null);
    }
  }
}
