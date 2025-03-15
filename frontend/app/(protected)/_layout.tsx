import { useState, useEffect } from "react";
import { Redirect, Slot, Stack, useNavigation } from "expo-router";
import { Drawer } from "expo-router/drawer";
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
    return <Redirect href="/(auth)/signin" />;
  }

  else {
    return (
      <BookContext.Provider value={bookContext}>
        <HighlightContext.Provider value={highlightContext}>
          <Stack />
        </HighlightContext.Provider>
      </BookContext.Provider>
    );
  }
}
