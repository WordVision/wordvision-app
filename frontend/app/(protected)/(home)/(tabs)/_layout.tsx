import { Tabs, useNavigation } from "expo-router";
import React, { useEffect } from "react";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { DrawerNavigationOptions } from "@react-navigation/drawer";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const navigation = useNavigation();

  // Navigation options as a drawer child
  useEffect(() => {
    navigation.setOptions({
      drawerLabel: "Home",
      title: "WordVision",
      drawerIcon: ({ color, focused }) => (
        <TabBarIcon
          name={focused ? "book" : "book-outline"}
          color={color}
        />
      ),
    } as DrawerNavigationOptions);
  }, [navigation]);


  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
      }}
    />
  );
}
