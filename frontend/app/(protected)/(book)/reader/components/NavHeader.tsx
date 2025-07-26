import Icon from "@/components/Icon";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Pressable, Text } from "react-native";

interface NavHeaderProps {
  title: string;
  show: boolean;
  onHide: () => void;
}

export default function NavHeader(p: NavHeaderProps) {

  const router = useRouter();

  const slideAnim = useRef(new Animated.Value(-100)).current; // header starts above screen

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
        toValue: -100,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [p.show])

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        paddingHorizontal: 20,
        paddingTop: 28,
        paddingBottom: 16,
        display: "flex",
        flexDirection: "row",
        gap: 10,
        alignItems: 'center',
        transform: [{ translateY: slideAnim }],
        zIndex: 1,
      }}
    >
      <Pressable
        onPress={() => router.back()}
        style={({pressed}) => ({
          paddingVertical: 6,
          paddingHorizontal: 10,
          borderRadius: 12,
          backgroundColor: pressed ? "#E2E4E9" : "white"
        })}
      >
        <Icon name="arrow-left" fill="#525866"/>
      </Pressable>
      <Text
        style={{
          color: 'black',
          fontSize: 20,
          flex: 1
        }}
      >
        {p.title}
      </Text>
      <Pressable
        onPress={p.onHide}
        style={({pressed}) => ({
          padding: 6,
          borderRadius: 100,
          borderWidth: 2,
          borderColor: "#E2E4E9",
          backgroundColor: pressed ? "#E2E4E9" : "white"
        })}
      >
        <Icon name="close" fill="#525866"/>
      </Pressable>
    </Animated.View>
  )
}


