import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface AvatarProps {
  firstName: string;
  lastName: string;
  width: string | number;
  height: string | number;
  fontSize: string | number;
  backgroundColor?: string;
  textColor?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  firstName,
  lastName,
  width,
  height,
  fontSize,
  backgroundColor = "#E5E7EB",
}) => {
  const initials =
    `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();

  const parsedWidth = typeof width === "string" ? parseFloat(width) : width;
  const parsedHeight = typeof height === "string" ? parseFloat(height) : height;
  const parsedFontSize =
    typeof fontSize === "string" ? parseFloat(fontSize) : fontSize;

  return (
    <View
      style={[
        styles.avatar,
        {
          width: parsedWidth,
          height: parsedHeight,
          borderRadius: Math.min(parsedWidth, parsedHeight) / 2,
          backgroundColor,
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            fontSize: parsedFontSize,
          },
        ]}
      >
        {initials}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  text: {
    fontWeight: "800",
    fontFamily: "Inter",
    textAlign: "center",
    letterSpacing: 2,
  },
});

export default Avatar;
