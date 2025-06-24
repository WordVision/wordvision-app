import Icon from "@/components/Icon";
import { useEffect, useRef } from "react";
import { Animated, Pressable, Text } from "react-native";

interface NavHeaderProps {
  title: string;
  show: boolean;
  onHide: () => void;
}

export default function NavHeader(p: NavHeaderProps) {

  const slideAnim = useRef(new Animated.Value(-100)).current; // header starts above screen

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
        toValue: -100,
        duration: 300,
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
        // height: 80,
        backgroundColor: 'white',
        // backgroundColor: 'tomato',
        paddingHorizontal: 20,
        paddingVertical: 16,
        display: "flex",
        flexDirection: "row",
        gap: 10,
        // justifyContent: 'center',
        alignItems: 'center',
        transform: [{ translateY: slideAnim }],
        zIndex: 1,
      }}
    >
      <Text
        style={{
          color: 'black',
          fontSize: 20,
          // backgroundColor: "blue",
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


