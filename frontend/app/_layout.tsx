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
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <BookProvider>
          <ReaderProvider>
            <GestureHandlerRootView>
              <BottomSheetModalProvider>
                <StatusBar translucent={true} style="auto" />
                <Slot />
              </BottomSheetModalProvider>
            </GestureHandlerRootView>
          </ReaderProvider>
        </BookProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
