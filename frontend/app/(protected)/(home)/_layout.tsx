import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import {
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
  DrawerContentComponentProps,
} from "@react-navigation/drawer";
import { View, StyleSheet } from "react-native";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import { supabase } from "@/lib/supabase";
import { useNavigation } from "expo-router";
import { useEffect } from "react";

export default function DrawerLayout() {

  const navigation = useNavigation();

  // Navigation options as a stack child
  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
    });
  }, [navigation]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer drawerContent={(props) => <SignOutBtn {...props} />}>
        <Drawer.Screen
          name="user"
          options={{
            drawerLabel: "Profile",
            title: "WordVision",
            drawerIcon: ({ color, focused }) => (
              <TabBarIcon
                name={focused ? "person" : "person-outline"}
                color={color}
              />
            ),
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

function SignOutBtn(props: DrawerContentComponentProps) {
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      {/* Render default drawer items */}
      <DrawerItemList {...props} />

      {/* Push the sign-out button to the bottom */}
      <View style={styles.signOutContainer}>
        <DrawerItem
          label="Sign Out"
          onPress={() => {
            // Auth.signOut();
            supabase.auth.signOut();
          }}
          icon={({ color, focused }) => (
            <TabBarIcon
              name={focused ? "exit" : "exit-outline"}
              color={color}
            />
          )}
        />
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  signOutContainer: {
    marginTop: "auto", // Pushes the button to the bottom
    borderTopWidth: 1,
    borderTopColor: "#ccc", // Optional: Add a border to separate the section
  },
});
