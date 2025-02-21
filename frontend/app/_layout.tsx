import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Slot } from "expo-router";
import { StatusBar } from 'expo-status-bar';

import { useColorScheme } from "@/hooks/useColorScheme";
import AuthProvider from "@/utilities/authProvider";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <StatusBar translucent={true} style="auto" />
        <Slot />
      </AuthProvider>
    </ThemeProvider>
  );
}
