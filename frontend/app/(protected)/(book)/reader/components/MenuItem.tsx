import Icon, { IconName } from "@/components/Icon";
import { Platform, Pressable, Text } from "react-native";

interface MenuItemProps {
  label: string;
  iconName: IconName;
}

export default function MenuItem(p: MenuItemProps) {

  return (
    <Pressable
      style={({ pressed }) => ({
        backgroundColor: pressed ? "#e5e5e5" : "white",
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-end",
        paddingVertical: 10,
        paddingHorizontal: 12,
        gap: 4,
        flex: 1,
      })}
    >
      <Text
      style= {{
        color: "#525866",
        fontFamily: Platform.select({
          android: 'Inter_500Medium',
          ios: 'Inter-Medium',
        }),
        fontSize: 14,
        paddingHorizontal: 4,
      }}
      >
        {p.label}
      </Text>

      <Icon name={p.iconName} />

    </Pressable>
  )
}
