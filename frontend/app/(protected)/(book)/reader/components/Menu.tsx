import Icon from "@/components/Icon";
import { useEffect, useRef, useState } from "react";
import { Pressable, Animated, Platform, View } from "react-native";
import MenuItem, { MenuItemProps } from "./MenuItem";

interface MenuButtonProps {
  show: boolean;
  menuItemDataList: MenuItemProps[];
}

export default function Menu(p: MenuButtonProps) {

  const slideAnim = useRef(new Animated.Value(100)).current; // button starts below screen
  const fadeAnim = useRef(new Animated.Value(0)).current; // menu list starts hidden

  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    if (p.show) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
    else {
      Animated.timing(slideAnim, {
        toValue: 150,
        duration: 150,
        useNativeDriver: true,
      }).start();

      setOpen(false);
    }
  }, [p.show])

  useEffect(() => {

    if (open) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
    else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [open])

  return (
    <Animated.View
      style={{
        position: 'absolute',
        bottom: 32,
        right: 16,
        transform: [{ translateY: slideAnim }],
        zIndex: 1,
        gap: 16,
      }}
    >
      <Animated.View
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 12,
          ...Platform.select({
            ios: {
              shadowColor: '#16181933',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.20,
              shadowRadius: 56,
            },
            android: {
              elevation: 4,
            }
          }),
          pointerEvents: open ? "auto": "none",
          opacity: fadeAnim,
        }}
      >

      {p.menuItemDataList.map((mid, idx) => {
        return (
          <View key={idx}>

            {idx > 0 && <MenuDivider/>}
            <MenuItem
              label={mid.label}
              iconName={mid.iconName}
              onPress={mid.onPress}
            />

          </View>
        )
      })}

      </Animated.View>

      <Pressable
        style={({pressed}) => ({
          opacity: pressed ? 0.85 : 1,
          backgroundColor: "#375DFB",
          justifyContent: 'center',
          alignItems: 'center',
          padding: 10,
          borderRadius: 100,
          alignSelf: "flex-end",
        })}
        onPress={() => setOpen(!open)}
      >
        <Icon name={open ? "close" : "menu"}/>
      </Pressable>

    </Animated.View>
  )
}

function MenuDivider() {
  return (
    <View style={{
      height: 1,
      width: "100%",
      backgroundColor: "#E2E4E9",
    }}></View>
  )
}

