import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "@/lib/supabase";

interface Book {
  id: string;
  title: string;
  author: string;
  img_url?: string | null;
}

interface BookContextType {
  books: Book[];
  userLibrary: string[];
  setBooks: (books: Book[]) => void;
  fetchBooks: () => Promise<void>;
  fetchUserLibrary: (userId: string) => Promise<void>;
}

export const BookContext = createContext<BookContextType | undefined>(
  undefined
);

export const BookProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [userLibrary, setUserLibrary] = useState<string[]>([]);

  useEffect(() => {
    loadCachedBooks();
  }, []);

  const loadCachedBooks = async () => {
    try {
      const cachedBooks = await AsyncStorage.getItem("books");
      const cachedLibrary = await AsyncStorage.getItem("userLibrary");
      if (cachedBooks) setBooks(JSON.parse(cachedBooks));
      if (cachedLibrary) setUserLibrary(JSON.parse(cachedLibrary));
    } catch (error) {
      console.error("Error loading cached data:", error);
    }
  };

  const fetchBooks = async () => {
    const { data, error } = await supabase
      .from("books")
      .select("id, title, author, img_url");
    if (data) {
      setBooks(data);
      await AsyncStorage.setItem("books", JSON.stringify(data)); // Cache books locally
    } else {
      console.error("Error fetching books:", error);
    }
  };

  const fetchUserLibrary = async (userId: string) => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("user_books")
      .select("book_id")
      .eq("user_id", userId);
    if (data) {
      setUserLibrary(data.map((entry) => entry.book_id));
      await AsyncStorage.setItem(
        "userLibrary",
        JSON.stringify(data.map((entry) => entry.book_id))
      ); // Cache library
    } else {
      console.error("Error fetching user library:", error);
    }
  };

  return (
    <BookContext.Provider
      value={{ books, userLibrary, setBooks, fetchBooks, fetchUserLibrary }}
    >
      {children}
    </BookContext.Provider>
  );
};

export const useBooks = (): BookContextType => {
  const context = useContext(BookContext);
  if (!context) {
    throw new Error("useBooks must be used within a BookProvider");
  }
  return context;
};
