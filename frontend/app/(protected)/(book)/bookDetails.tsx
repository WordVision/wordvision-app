import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  StyleSheet,
  TextInput,
  Button,
  Modal,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { AuthContext, User, getUser } from "@/utilities/authContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/FontAwesome";
import { Link, router, useLocalSearchParams, useRouter } from "expo-router";
import { BookContext } from "@/utilities/bookContext";
import { Book } from "@/utilities/backendService";
import Loading from "@/components/Loading";
import {
  deleteUserSelectedBook,
  getBookMetaData,
} from "@/utilities/backendService";
import { useAuth } from "@/utilities/authProvider";
import { supabase } from "@/lib/supabase";
import { useBooks } from "@/contexts/BookContext";

export default function BookDetailsPage() {
  const user = useContext(AuthContext) as User;
  const { session } = useAuth();
  const { userLibrary, fetchUserLibrary } = useBooks();
  const { setBooks } = useContext(BookContext);

  const [book, setBook] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState("");
  const [isStarred, setIsStarred] = useState(false);
  const [isClocked, setIsClocked] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [modelVisible, setModelVisible] = useState(false);
  const [deletingBook, setDeletingBook] = useState(false);
  const [deleteError, setDeleteError] = useState(false);
  const [isOwned, setIsOwned] = useState(false);

  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const navigation = useNavigation();
  const router = useRouter();

  // Ensure `isOwned` updates when `userLibrary` changes
  useEffect(() => {
    if (book) {
      setIsOwned(userLibrary.includes(book.id));
    }
  }, [userLibrary, book]);

  // Navigation options as a stack child
  useEffect(() => {
    navigation.setOptions({
      headerShown: true,
      title: "Book Details",
      headerRight: () => (
        <View>
          {isOwned ? (
            <TouchableOpacity
              onPress={() =>
                router.push(`/(protected)/(book)/reader/${book.id}`)
              }
            >
              <Text style={styles.readButton}>Read</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleAddBook}>
              <Icon style={styles.readButton} name="plus" size={24} />
            </TouchableOpacity>
          )}
        </View>
      ),
    });
  }, [navigation, isOwned, book]);

  useEffect(() => {
    const fetchBookDetails = async () => {
      setLoading(true);

      console.log(bookId);

      const { data, error } = await supabase
        .from("books")
        .select()
        .eq("id", bookId)
        .limit(1)
        .single();

      console.log({ data });

      if (data) {
        setBook(data);
        setIsOwned(userLibrary.includes(data.id));
      } else {
        Alert.alert(
          "Error",
          `An error occurred while fetching book details: ${error?.message}`
        );
      }

      setLoading(false);
    };

    fetchBookDetails();
  }, [bookId, userLibrary]);

  const handleAddBook = async () => {
    if (!session?.user?.id || !book?.id) {
      console.error("User or Book ID is missing!");
      return;
    }

    console.log(`Adding book to library: ${book.title} (ID: ${book.id})`);

    try {
      // Insert into Supabase
      const { error } = await supabase
        .from("user_books")
        .insert([{ user_id: session.user.id, book_id: book.id }]);

      if (error) {
        console.error("Supabase insert error:", error);
        return;
      }

      console.log("Book successfully added to Supabase!");

      // Update local cache
      const updatedLibrary = [...userLibrary, book.id];
      await AsyncStorage.setItem("userLibrary", JSON.stringify(updatedLibrary));

      // Refresh user books in context
      await fetchUserLibrary(session.user.id);
      setIsOwned(true);
    } catch (err) {
      console.error("Error adding book:", err);
    }
  };

  if (loading) {
    return <Loading message="Loading book details..." />;
  }

  if (!book) {
    return <Text>No book details available</Text>;
  }

  const formatFileSize = (size: number) => {
    if (size >= 1048576) {
      return `${(size / 1048576).toFixed(2)} MB`;
    } else if (size >= 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    }
    return `${size} Bytes`;
  };

  const handleNotesChange = async (text: string) => {
    setNotes(text);
    try {
      await AsyncStorage.setItem(`notes_${bookId}`, text);
    } catch (error) {
      console.error("Failed to save notes to AsyncStorage:", error);
    }
  };

  const toggleStar = async () => {
    const newState = !isStarred;
    setIsStarred(newState);
    await AsyncStorage.setItem(`isStarred_${bookId}`, JSON.stringify(newState));
  };

  const toggleClock = async () => {
    const newState = !isClocked;
    setIsClocked(newState);
    if (newState) setIsChecked(false);
    await AsyncStorage.setItem(`isClocked_${bookId}`, JSON.stringify(newState));
    await AsyncStorage.setItem(`isChecked_${bookId}`, JSON.stringify(false));
  };

  const toggleCheck = async () => {
    const newState = !isChecked;
    setIsChecked(newState);
    if (newState) setIsClocked(false);
    await AsyncStorage.setItem(`isChecked_${bookId}`, JSON.stringify(newState));
    await AsyncStorage.setItem(`isClocked_${bookId}`, JSON.stringify(false));
  };

  const handleDeleteAction = async () => {
    setModelVisible(true);
  };

  const handleConfirm = async () => {
    setDeletingBook(true);

    try {
      const response = await deleteUserSelectedBook(user, bookId);

      if (response) {
        setBooks((books: Book[]) => books.filter((book) => book.id !== bookId));
        setDeletingBook(false);
        setModelVisible(false);

        router.navigate("./library");
      } else {
        setDeletingBook(false);
        setDeleteError(true);
      }
    } catch (err) {
      console.log(`Exception while deleting book: ${err}.`);
      setDeletingBook(false);
      setDeleteError(true);
    }
  };

  const handleCancel = () => {
    setModelVisible(false);
  };

  return (
    <View style={styles.container}>
      {/*

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-left" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>About Document</Text>

        <TouchableOpacity
          onPress={() => {
            navigation.navigate("bookReader", { bookId });
          }}
        >
          <Text style={styles.readButton}>Read</Text>
        </TouchableOpacity>
      </View>
*/}

      {/*

      <Modal
        transparent={true}
        visible={modelVisible}
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {deletingBook ? (
              <Loading message="Deleting book..." />
            ) : deleteError ? (
              <>
                <Text style={styles.modalText}>Error deleting book</Text>
                <View style={styles.buttonContainer}>
                  <Button
                    title="Close"
                    onPress={() => {
                      setModelVisible(false);
                      setDeleteError(false);
                    }}
                  />
                </View>
              </>
            ) : (
              <>
                <Text style={styles.modalText}>
                  {"Are you sure you want to Delete this book?"}
                </Text>
                <View style={styles.buttonContainer}>
                  <Button title="Confirm" onPress={handleConfirm} />
                  <Button title="Cancel" onPress={handleCancel} />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      */}

      <View style={styles.bookImageContainer}>
        <Image
          source={{ uri: book.img_url || "https://placehold.co/300x450" }}
          style={styles.bookImage}
        />
      </View>

      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle}>{book.title}</Text>

        <Text style={styles.bookAuthor}>by {book.author}</Text>

        <View style={styles.actionIcons}>
          {/*

          <TouchableOpacity onPress={toggleStar}>
            <Icon
              name="star"
              size={24}
              style={{
                color: isStarred ? "blue" : "gray",
                marginHorizontal: 10,
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleClock}>
            <Icon
              name="clock-o"
              size={24}
              style={{
                color: isClocked ? "blue" : "gray",
                marginHorizontal: 10,
              }}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleCheck}>
            <Icon
              name="check"
              size={24}
              style={{
                color: isChecked ? "blue" : "gray",
                marginHorizontal: 10,
              }}
            />
          </TouchableOpacity>

          */}

          <TouchableOpacity
            onPress={() => {
              navigation.navigate("highlights", { bookId: bookId });
            }}
          >
            <Icon
              name="quote-left"
              size={24}
              style={{
                color: "gray",
                marginHorizontal: 10,
              }}
            />
          </TouchableOpacity>

          {/*

          <TouchableOpacity onPress={handleDeleteAction}>
            <Icon
              name="trash"
              size={24}
              style={{ color: "gray", marginHorizontal: 10 }}
            />
          </TouchableOpacity>

          */}
        </View>

        {/*

        <Text style={styles.bookMeta}>Last time read: (Date and Time)</Text>

        <Text style={styles.bookMeta}>
          File Type: {book.type}, Size: {formatFileSize(book.size)}
        </Text>

        */}
      </View>

      {/*

      <View style={styles.notesSection}>
        <Text style={styles.notesHeader}>Notes:</Text>
        <TextInput
          style={styles.notesInput}
          multiline
          placeholder="Write your notes here..."
          value={notes}
          onChangeText={handleNotesChange}
        />
      </View>

      */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  readButton: {
    fontSize: 18,
    color: "#007BFF",
  },
  bookImageContainer: {
    justifyContent: "flex-start",
    marginBottom: 20,
  },
  bookImage: {
    width: 200,
    height: 300,
    resizeMode: "contain",
  },
  bookInfo: {
    alignItems: "flex-start",
    marginVertical: 20,
  },
  bookTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  bookAuthor: {
    fontSize: 18,
    color: "#666",
    marginBottom: 10,
  },
  actionIcons: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginVertical: 10,
    width: "80%",
  },
  icon: {
    marginHorizontal: 10,
  },
  bookMeta: {
    fontSize: 14,
    color: "#666",
    marginVertical: 2,
  },
  notesSection: {
    marginTop: 20,
  },
  notesHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
    color: "#333",
    minHeight: 100,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: 350,
    padding: 30,
    backgroundColor: "white",
    borderRadius: 10,
    elevation: 5,
  },
  modalText: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
