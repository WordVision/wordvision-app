import React from "react";
import {
  FlatList,
  View,
  RefreshControl,
  TouchableOpacity,
  Image,
  Text,
  StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import ConfirmationModal from "@/components/ConfirmationModal";

interface Book {
  id: string;
  title: string;
  author: string;
  img_url?: string | null;
}

interface BookListProps {
  books: Book[];
  loading: boolean;
  refreshBooks: () => void;
  showAddButton?: boolean;
  onAddBook?: (book: Book) => void;
  ownedBooks?: string[]; // List of book IDs the user already owns
}

const BookList: React.FC<BookListProps> = ({
  books,
  loading,
  refreshBooks,
  showAddButton = false,
  onAddBook,
  ownedBooks = [],
}) => {
  const router = useRouter();
  const [selectedBook, setSelectedBook] = React.useState<Book | null>(null);
  const [modalVisible, setModalVisible] = React.useState(false);

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshBooks} />
        }
        ListEmptyComponent={
          <View style={{ flex: 1, justifyContent: "center" }}>
            <ThemedText style={{ textAlign: "center" }}>
              No books available.
            </ThemedText>
          </View>
        }
        renderItem={({ item }) => {
          const alreadyOwned = ownedBooks.includes(item.id);

          return (
            <TouchableOpacity
              onPress={() =>
                router.push(`/(protected)/(book)/bookDetails?bookId=${item.id}`)
              }
              style={styles.cardContainer}
            >
              <View style={styles.card}>
                {item.img_url ? (
                  <Image
                    source={{
                      uri: item.img_url || "https://placehold.co/100x150",
                    }}
                    style={styles.bookImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.cardContent}>
                    <Text style={styles.bookTitle}>{item.title}</Text>
                    <Text style={styles.bookAuthor}>{item.author}</Text>
                  </View>
                )}

                {showAddButton && !alreadyOwned && (
                  <TouchableOpacity
                    onPress={() => {
                      setSelectedBook(item);
                      setModalVisible(true);
                    }}
                    style={styles.addButton}
                  >
                    <Ionicons
                      name="add-circle-outline"
                      size={24}
                      color="blue"
                    />
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.cardList}
        numColumns={2}
      />

      <ConfirmationModal
        visible={modalVisible}
        message="Would you like to add this book to your library?"
        onConfirm={() => {
          if (selectedBook && onAddBook) {
            onAddBook(selectedBook);
          }
          setModalVisible(false);
        }}
        onCancel={() => setModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  cardContainer: {
    flex: 1,
    margin: 5,
    maxWidth: "50%",
  },
  card: {
    padding: 16,
    backgroundColor: "#FFF",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    width: 150,
    aspectRatio: 0.65,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bookImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },
  cardContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  bookTitle: {
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
  },
  bookAuthor: {
    color: "#666",
    fontSize: 12,
    textAlign: "center",
  },
  addButton: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "white",
    borderRadius: 50,
    padding: 4,
    elevation: 3,
  },
  cardList: {
    flex: 1,
  },
});

export default BookList;
