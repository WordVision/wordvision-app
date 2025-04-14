import { useEffect, useState } from "react";
import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View, Image } from "react-native";
import Animated, { SlideInDown } from "react-native-reanimated";
import { VisualAnnotation } from "./bookReader";
import Feather from "@expo/vector-icons/Feather";
import CustomImagePrompt from "@/components/CustomImagePrompt";

export default function ImageModal() {
  const { annotationObj } = useLocalSearchParams<{ annotationObj: string }>();
  const annotation: VisualAnnotation = JSON.parse(
    decodeURIComponent(annotationObj)
  );

  const navigation = useNavigation();
  const router = useRouter();

  const [customPromptIsVisible, setCustomPromptIsVisible] =
    useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>(annotation.data.img_prompt);
  const [imgUrl, setImgUrl] = useState<string>(annotation.data.img_url);

  useEffect(() => {
    navigation.setOptions({
      headerShown: false,
      presentation: "transparentModal",
      animation: "fade",
    });
  }, [navigation]);

  useEffect(() => {
    // Fix local development image URL
    if (__DEV__ && imgUrl.includes("host.docker.internal")) {
      setImgUrl(imgUrl.replace("host.docker.internal", "localhost"));
    }
  }, []);

  return (
    <View style={s.backdrop}>
      {/* Dismiss modal when pressing outside */}
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={() => router.dismiss()}
      />

      <Animated.View entering={SlideInDown} style={s.contentContainer}>
        <View style={s.headerGroup}>
          <Text style={s.headerTitle}>Generated Image</Text>

          <Pressable onPress={() => setCustomPromptIsVisible(true)}>
            <Feather name="edit" size={18} />
          </Pressable>
        </View>

        <Image source={{ uri: imgUrl }} style={s.image} />
      </Animated.View>

      {customPromptIsVisible && (
        <CustomImagePrompt
          annotation={annotation}
          closeHandler={() => setCustomPromptIsVisible(false)}
          onImageGenerated={(imgUrl, prompt) => {
            setImgUrl(imgUrl);
            setPrompt(prompt);
          }}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#00000040",
  },

  contentContainer: {
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    gap: 8,
  },

  headerGroup: {
    display: "flex",
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTitle: {
    fontWeight: "bold",
    fontSize: 18,
  },

  image: {
    width: 300,
    height: 300,
  },

  closeButtonText: {
    marginTop: 20,
    color: "blue",
    fontWeight: "bold",
    fontSize: 20,
  },
});
