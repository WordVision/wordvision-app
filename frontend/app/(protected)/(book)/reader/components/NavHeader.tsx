import { useEffect, useRef } from "react";
import { Animated, Pressable, Text } from "react-native";
// import Animated from "react-native-reanimated";

import {Svg, Path} from "react-native-svg";

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
        <CloseIcon />
      </Pressable>
    </Animated.View>
  )
}


function CloseIcon() {
  return (
    <Svg width="18" height="18" viewBox="0 0 16 16" fill="none">
      <Path d="M8.00004 7.15164L10.97 4.18164L11.8184 5.03004L8.84844 8.00004L11.8184 10.97L10.97 11.8184L8.00004 8.84844L5.03004 11.8184L4.18164 10.97L7.15164 8.00004L4.18164 5.03004L5.03004 4.18164L8.00004 7.15164Z" fill="#525866"/>
    </Svg>
  )
}


