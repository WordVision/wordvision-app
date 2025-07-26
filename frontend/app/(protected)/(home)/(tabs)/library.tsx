import React, { useState, useEffect } from "react";
import { useBooks } from "@/contexts/BookContext";
import BookList from "@/components/BookList";
import { useAuth } from "@/utilities/authProvider";
import { useFocusEffect } from "@react-navigation/native";
import { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";

export default function LibraryScreen() {
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
        <TabBarIcon name={focused ? "book" : "book-outline"} color={color} />
      ),
    } as BottomTabNavigationOptions);
  }, [navigation]);

  const checkAndFetchData = async () => {
    if (session?.user?.id) {
      await fetchUserLibrary(session.user.id); // Fetch only user's books
    }
    setLoading(false);
  };

  const userBooks = books.filter((book) => userLibrary.includes(book.id));

  return (
    <BookList
      books={userBooks}
      loading={loading}
      refreshBooks={fetchBooks}
      source="library"
    />
  );
}
