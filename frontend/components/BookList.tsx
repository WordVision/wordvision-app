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
import Avatar from "./Avator";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useState } from "react";
import { useEffect } from "react";

import { supabase } from "@/lib/supabase";
import HeaderLayout from "./Headerlayout";
import { ScrollView } from "react-native-gesture-handler";

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
  source: "library" | "bookstore";
}

const BookList: React.FC<BookListProps> = ({
  books,
  loading,
  refreshBooks,
  showAddButton = false,
  onAddBook,
  ownedBooks = [],
  source,
}) => {
  const router = useRouter();
  const [selectedBook, setSelectedBook] = React.useState<Book | null>(null);
  const [modalVisible, setModalVisible] = React.useState(false);

  const [userData, setUserData] = useState<{
    email: string;
    firstName: string;
    lastName: string;
    birthDate: string;
  }>();

  useEffect(() => {
    const fetchUserData = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserData({
          email: data.user.email ?? "",
          firstName: data.user.user_metadata.first_name,
          lastName: data.user.user_metadata.last_name,
          birthDate: data.user.user_metadata.birthdate,
        });
      }
    };
    fetchUserData();
  }, []);

  const headerText = source === "library" ? "Saved" : "Discover";

  return (
    <View style={styles.rootContainer}>
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
          ListHeaderComponent={
            <>
              <HeaderLayout text={headerText}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => router.push("/(protected)/(home)/user")}
                >
                  <Avatar
                    firstName={userData?.firstName ?? ""}
                    lastName={userData?.lastName ?? ""}
                    width={55}
                    height={55}
                    fontSize={23}
                  />
                </TouchableOpacity>
              </HeaderLayout>

              {source === "bookstore" && (
                <Text style={styles.featuredText}>Featured</Text>
              )}
            </>
          }
          renderItem={({ item }) => {
            const alreadyOwned = ownedBooks.includes(item.id);

            return (
              <TouchableOpacity
                onPress={() => router.push(`/reader/${item.id}`)}
                style={styles.cardContainer}
              >
                <View style={styles.card}>
                  {item.img_url ? (
                    <Image
                      source={{ uri: item.img_url }}
                      style={styles.bookImage}
                    />
                  ) : (
                    <View style={styles.noCover}>
                      <Text style={styles.noCoverText}>No Cover</Text>
                    </View>
                  )}

                  <View style={styles.textContainer}>
                    <Text
                      style={styles.bookTitle}
                      numberOfLines={2}
                      ellipsizeMode="tail"
                    >
                      {item.title}
                    </Text>

                    <Text
                      style={styles.bookAuthor}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {item.author}
                    </Text>
                  </View>

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
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    marginTop: 35,
  },
  container: {
    flex: 1,
    paddingHorizontal: 8,
  },
  cardContainer: {
    flex: 1,
    margin: 5,
    maxWidth: "50%",
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    overflow: "hidden",
    width: "100%",
    height: 260,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 4,
  },
  bookImage: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  noCover: {
    width: "100%",
    height: 180,
    backgroundColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  noCoverText: {
    color: "#6B7280",
    fontSize: 20,
  },
  textContainer: {
    padding: 8,
    flex: 1,
    maxWidth: "100%",
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2C3131",
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 12,
    color: "#747878",
  },
  addButton: {
    position: "absolute",
    bottom: 6,
    right: 6,
    backgroundColor: "#fff",
    borderRadius: 50,
    padding: 2,
    elevation: 2,
  },
  cardList: {
    paddingBottom: 16,
  },

  featuredText: {
    paddingHorizontal: 16,
    fontSize: 24,
    fontWeight: "bold",
    color: "#1F2937",
    fontFamily: "Inter_600SemiBold",
  },
});

export default BookList;
