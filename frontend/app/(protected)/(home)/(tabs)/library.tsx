import React, { useState } from "react";
import { useBooks } from "@/contexts/BookContext";
import BookList from "@/components/BookList";
import { useAuth } from "@/utilities/authProvider";
import { useFocusEffect } from "@react-navigation/native";

export default function LibraryScreen() {
  const { books, userLibrary, fetchBooks, fetchUserLibrary } = useBooks();
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);

  useFocusEffect(() => {
    checkAndFetchData();
  });

  const checkAndFetchData = async () => {
    if (session?.user?.id) {
      await fetchUserLibrary(session.user.id);
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
