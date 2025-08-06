import * as DocumentPicker from "expo-document-picker";
import { Alert } from "react-native";

import ePub from "epubjs";

import { supabase } from "@/lib/supabase";

export const uploadEpub = async (user: any, onUploadComplete: () => void) => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/epub+zip",
      copyToCacheDirectory: true,
      multiple: false,
    });

    if (result.canceled) return;

    const file = result.assets?.[0];
    if (!file || !file.name.toLowerCase().endsWith(".epub")) {
      Alert.alert("Invalid File", "Only .epub files are supported.");
      return;
    }

    const formData = new FormData();
    formData.append("file", {
      uri: file.uri,
      type: "application/epub+zip",
      name: file.name,
    } as any);

    const filePath = file.name;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("books")
      .upload(`${user.id}/${filePath}`, formData, {
        upsert: true,
      });

    if (uploadError || !uploadData) {
      Alert.alert("Upload Failed", uploadError.message);
      return;
    }

    await saveMetadata(user, file, uploadData.id);
    onUploadComplete();
  } catch (err) {
    console.error("Upload error", err);
    Alert.alert("Error", "Something went wrong while uploading.");
  }
};

const saveMetadata = async (
  user: any,
  file: DocumentPicker.DocumentPickerAsset,
  bookId: string
) => {
  try {
    const response = await fetch(file.uri);
    const buffer = await response.arrayBuffer();
    const book = ePub(buffer);
    const metadata = await book.loaded.metadata;

    const title = metadata.title || "Untitled";
    const author = metadata.creator || "Unknown Author";

    const { error: insertError } = await supabase.from("books").insert({
      id: bookId,
      title,
      author,
      filename: `${user.id}/${file.name}`,
    });

    if (insertError) {
      console.error("Insert error:", insertError.message);
      return;
    }

    const { error: linkError } = await supabase.from("user_books").insert({
      user_id: user.id,
      book_id: bookId,
    });

    if (linkError) {
      console.error("Link error:", linkError.message);
    }
  } catch (err) {
    console.error("Metadata extraction or DB error:", err);
  }
};
