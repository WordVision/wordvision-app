import React, { useState, useEffect } from "react";
import { useBooks } from "@/contexts/BookContext";
import BookList from "@/components/BookList";
import { useAuth } from "@/utilities/authProvider";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";

interface Book {
  id: string;
  title: string;
  author: string;
  img_url?: string | null;
}

export default function BookStore() {
  const { books, userLibrary, fetchBooks, fetchUserLibrary } = useBooks();
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useFocusEffect(() => {
    checkAndFetchData();
  });

  useEffect(() => {
    navigation.setOptions({
      title: "Library",
      tabBarIcon: ({ color, focused }) => (
        <TabBarIcon name={focused ? "cart" : "cart-outline"} color={color} />
      ),
    } as BottomTabNavigationOptions);
  }, [navigation]);

  const checkAndFetchData = async () => {
    const cachedBooks = await AsyncStorage.getItem("books");
    if (!cachedBooks) {
      await fetchBooks(); // Fetch only if cache is empty
    }

    if (session?.user?.id) {
      const cachedLibrary = await AsyncStorage.getItem("userLibrary");
      if (!cachedLibrary) {
        await fetchUserLibrary(session.user.id); // Fetch user books only if needed
      }
    }

    setLoading(false);
  };

  const handleAddBook = async (book: Book) => {
    if (!session?.user?.id) return;

    console.log(`Adding book to library: ${book.title} (ID: ${book.id})`);

    // Simulate adding the book and updating the cache
    const updatedLibrary = [...userLibrary, book.id];
    await AsyncStorage.setItem("userLibrary", JSON.stringify(updatedLibrary));

    // Refresh user books in context
    await fetchUserLibrary(session.user.id);
  };

  return (
    <BookList
      books={books}
      loading={loading}
      refreshBooks={fetchBooks}
      showAddButton
      onAddBook={handleAddBook}
      ownedBooks={userLibrary}
    />
  );
}
