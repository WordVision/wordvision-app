import { useEffect, useRef } from "react";
import { Text, Animated, Pressable, Platform } from "react-native";

interface ActionBarProps {
  show: boolean;
  onVisualize: () => void;
}

export default function ActionBar(p: ActionBarProps) {

  const slideAnim = useRef(new Animated.Value(100)).current; // header starts above screen

  useEffect(() => {
    if (p.show) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
    else {
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [p.show])

  return (

    <Animated.View
      style={{
        position: "absolute",
        marginHorizontal: 20,
        bottom: 20,
        left: 0,
        right: 0,
        zIndex: 1,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <Pressable
        style={{
          borderRadius: 100,
          backgroundColor: "#7F56D9",
          paddingVertical: 10,
          alignItems: "center",
        }}
        onPress={p.onVisualize}
      >
        <Text
          style={{
            color: "white",
            fontFamily: Platform.select({
              android: 'Inter_600SemiBold',
              ios: 'Inter-SemiBold',
            }),
          }}
        >Visualize it</Text>
      </Pressable>
    </Animated.View>

  )
}
