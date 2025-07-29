import React, { useState } from "react";
import { useBooks } from "@/contexts/BookContext";
import BookList from "@/components/BookList";
import { useAuth } from "@/utilities/authProvider";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";

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

  useFocusEffect(() => {
    checkAndFetchData();
  });

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

    try {
      // ✅ Insert into Supabase
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
    } catch (err) {
      console.error("Error adding book:", err);
    }
  };

  return (
    <BookList
      books={books}
      loading={loading}
      refreshBooks={fetchBooks}
      showAddButton
      onAddBook={handleAddBook}
      ownedBooks={userLibrary}
      source="bookstore"
    />
  );
}
