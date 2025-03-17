import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ReaderProvider } from "@epubjs-react-native/core";

import { useColorScheme } from "@/hooks/useColorScheme";
import AuthProvider from "@/utilities/authProvider";
import { BookProvider } from "@/contexts/BookContext";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <BookProvider>
          <ReaderProvider>
            <StatusBar translucent={true} style="auto" />
            <Slot />
          </ReaderProvider>
        </BookProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
