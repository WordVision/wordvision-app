import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  StyleSheet,
  Image,
  TouchableOpacity,
  Text,
  View,
  FlatList,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Loading from "@/components/Loading";
import { BookContext } from "@/utilities/bookContext";
import { supabase } from "@/lib/supabase";
import { RefreshControl } from "react-native-gesture-handler";
import { ThemedText } from "@/components/ThemedText";
import { useRouter } from "expo-router";
import { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import ConfirmationModal from "@/components/ConfirmationModal";
import { useAuth } from "@/utilities/authProvider";

export default function BookStore() {
  const { books, setBooks } = useContext(BookContext);
  const [loading, setLoading] = useState<boolean>(true);
  const { session } = useAuth();
  const [selectedBook, setSelectedBook] = useState<{ id: string } | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const navigation = useNavigation();
  const router = useRouter();

  useEffect(() => {
    navigation.setOptions({
      title: "Book Store",
      tabBarIcon: ({ color, focused }) => (
        <TabBarIcon name={focused ? "cart" : "cart-outline"} color={color} />
      ),
    } as BottomTabNavigationOptions);
  }, [navigation]);

  useFocusEffect(
    useCallback(() => {
      fetchBooks();
    }, [])
  );

  const handleAddBook = async () => {
    if (!selectedBook || !session?.user?.id) return;

    const { error } = await supabase
      .from("user_books")
      .insert([{ user_id: session.user.id, book_id: selectedBook?.id }]);

    if (error) {
      Alert.alert("Error", "Failed to add book to library.");
      console.error("Insert error:", error);
    } else {
      Alert.alert("Success", "Book added to your library!");
    }

    setModalVisible(false);
  };

  const fetchBooks = async () => {
    const { data, error } = await supabase.from("books").select(
      `
        id, title, author, img_url
      `
    );

    console.log({ data });
    console.log({ error });

    if (data) {
      setBooks(data);
    } else {
      setBooks([]);
      console.error("Error fetching books:", error);
      Alert.alert("Error", "An error occurred while fetching books.");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  if (loading) {
    return <Loading message="Loading books..." />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={books}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={fetchBooks} />
        }
        ListEmptyComponent={
          <View
            style={{
              flex: 1,
              justifyContent: "center",
            }}
          >
            <ThemedText style={{ textAlign: "center" }}>
              Fetching books...
            </ThemedText>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              // navigation.navigate("bookDetails", { bookId: item.id }); // Navigate to book details
              router.push(`/(protected)/(book)/bookDetails?bookId=${item.id}`);
            }}
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
              <TouchableOpacity
                onPress={() => {
                  setSelectedBook({ id: item.id });
                  setModalVisible(true);
                }}
                style={styles.addButton}
              >
                <Ionicons name="add-circle-outline" size={24} color="blue" />
              </TouchableOpacity>

              <ConfirmationModal
                visible={modalVisible}
                message="Would you like to add this book to your library?"
                onConfirm={handleAddBook}
                onCancel={() => setModalVisible(false)}
              />
            </View>
          </TouchableOpacity>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.cardList}
        numColumns={2}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    display: "flex",
    // justifyContent: "center",
    // alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    // backgroundColor: "blue"
  },
  headerRight: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  uploadButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  cardContainer: {
    flex: 1,
    margin: 5,
    // backgroundColor: "red",
    maxWidth: "50%",
  },
  card: {
    padding: 16,
    backgroundColor: "#FFF",
    borderRadius: 8,
    display: "flex",
    // flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    width: 150,
    aspectRatio: 0.65,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bookImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    // borderRadius: 8,
    // borderTopRightRadius: 8,
  },
  cardContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    // padding: 5,
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
  cardList: {
    flex: 1,
    // paddingHorizontal: 16,
    // paddingBottom: 16,
    // justifyContent: "space-evenly",
    // backgroundColor: "green"
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalView: {
    width: 350,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 50,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 18,
  },
  buttonRow: {
    marginTop: 15,
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  button: {
    borderRadius: 10,
    padding: 10,
    elevation: 2,
  },
  buttonClose: {
    backgroundColor: "#007BFF",
  },
  buttonPick: {
    backgroundColor: "#28A745",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
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
});
