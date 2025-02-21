import { useState, useEffect } from "react";
import { Redirect, Slot, useNavigation } from "expo-router";
import { BookContext } from "@/utilities/bookContext";
import { type Book } from "@/utilities/backendService";
import { type Highlight } from "@/utilities/backendService";
import { HighlightContext } from "@/utilities/highlightContext";
import { useAuth } from "@/utilities/authProvider";

export default function DrawerLayout() {
  const [books, setBooks] = useState<Book[]>([]);
  const bookContext = { books, setBooks };
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const highlightContext = { highlights, setHighlights };

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ headerShown: false });
  }, [navigation]);

  const { session } = useAuth();

  if (!session) {
    return <Redirect href="/login" />;
  }

  else {
    return (
      <BookContext.Provider value={bookContext}>
        <HighlightContext.Provider value={highlightContext}>
          <Slot />
        </HighlightContext.Provider>
      </BookContext.Provider>
    );
  }
}
