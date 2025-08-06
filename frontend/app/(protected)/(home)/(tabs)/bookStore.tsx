import React from "react";
import BookList from "@/components/BookList";

interface Book {
  id: string;
  title: string;
  author: string;
  img_url?: string | null;
}

export default function BookStore() {
  const emptyBooks: Book[] = [];

  // const { books, userLibrary, fetchBooks, fetchUserLibrary } = useBooks();
  // const { session } = useAuth();
  // const [loading, setLoading] = useState(true);

  // useFocusEffect(() => {
  //   checkAndFetchData();
  // });

  // const checkAndFetchData = async () => {
  //   const cachedBooks = await AsyncStorage.getItem("books");
  //   if (!cachedBooks) {
  //     await fetchBooks(); // Fetch only if cache is empty
  //   }

  //   if (session?.user?.id) {
  //     const cachedLibrary = await AsyncStorage.getItem("userLibrary");
  //     if (!cachedLibrary) {
  //       await fetchUserLibrary(session.user.id); // Fetch user books only if needed
  //     }
  //   }

  //   setLoading(false);
  // };

  // const handleAddBook = async (book: Book) => {
  //   if (!session?.user?.id) return;

  //   console.log(`Adding book to library: ${book.title} (ID: ${book.id})`);

  //   try {
  //     const { error } = await supabase
  //       .from("user_books")
  //       .insert([{ user_id: session.user.id, book_id: book.id }]);

  //     if (error) {
  //       console.error("Supabase insert error:", error);
  //       return;
  //     }

  //     console.log("Book successfully added to Supabase!");

  //     const updatedLibrary = [...userLibrary, book.id];
  //     await AsyncStorage.setItem("userLibrary", JSON.stringify(updatedLibrary));

  //     await fetchUserLibrary(session.user.id);
  //   } catch (err) {
  //     console.error("Error adding book:", err);
  //   }
  // };

  return <BookList books={emptyBooks} loading={false} source="bookstore" />;
}
