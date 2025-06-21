import React, { forwardRef, useCallback } from 'react';
import { View, Text, Platform, Image, Pressable } from 'react-native';
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { Visualization } from '../types';

interface Props {
  onClose: () => void;
  onVisualizeEmptyHighlight: () => void;
  visualization?: Visualization;
  error?: string;
}
export type Ref = BottomSheetMethods;

export const ImageVisualizer = forwardRef<Ref, Props>((p, ref) => {

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        enableTouchThrough={false}
        onPress={p.onClose}
      />
    ),
    []
  );

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={false}
      style={{
        backgroundColor: "white",
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
      }}
      handleComponent={null}
    >
      <BottomSheetView style={{
        padding: 20,
        gap: 20,
        alignItems: 'center'
      }}>

      {p.error ?

        <View
          style={{
            width: 320,
            height: 320,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "black",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            backgroundColor: "#fecaca"
          }}
        >
          <Text
            style={{
              textAlign: "center",
              fontFamily: Platform.select({
                android: 'Inter_600SemiBold',
                ios: 'Inter-SemiBold',
              }),
            }}
          >
            {p.error}
          </Text>
        </View>

      : p.visualization ? p.visualization.img_url ?

        <Image
          src={p.visualization.img_url}
          style={{
            width: 320,
            height: 320,
            borderRadius: 12,
          }}
        />
      :
        <View
          style={{
            width: 320,
            height: 320,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "black",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <Text
            style={{
              textAlign: "center",
              fontFamily: Platform.select({
                android: 'Inter_600SemiBold',
                ios: 'Inter-SemiBold',
              }),
            }}
          >
            This highlight has no image associated with it.
          </Text>
        </View>
      :
        <Image
          source={require("@/assets/images/purple_loading_image.gif")}
          style={{
            width: 320,
            height: 320,
            borderRadius: 12,
          }}
        />
      }

      {p.error ?

        <Pressable
          onPress={p.onClose}
          style={{
            borderRadius: 100,
            backgroundColor: "#991b1b",
            paddingVertical: 10,
            width: "100%",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "white",
              fontFamily: Platform.select({
                android: 'Inter_600SemiBold',
                ios: 'Inter-SemiBold',
              }),
            }}
          >
            Close
          </Text>
        </Pressable>

      : p.visualization ? p.visualization.img_url ?

        <View
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "row",
            gap: 12,
            justifyContent: "center",
          }}
        >
          <Pressable
            style={({pressed}) => ({
              backgroundColor: pressed ? "#1A1A1A33" : "white",
              borderRadius: 12,
              alignItems: "center",
              paddingHorizontal: 12,
              paddingVertical: 8,
              gap: 4,
            })}
          >
            <TrashIcon/>
            <Text
              style={{
                color: "#7F56D9",
                fontFamily: Platform.select({
                  android: 'Inter_600SemiBold',
                  ios: 'Inter-SemiBold',
                }),
              }}
            >
              Delete
            </Text>
          </Pressable>
        </View>
      :
        <Pressable
          style={{
            borderRadius: 100,
            backgroundColor: "#7F56D9",
            paddingVertical: 10,
            width: "100%",
            alignItems: "center",
          }}
          onPress={p.onVisualizeEmptyHighlight}
        >
          <Text
            style={{
              color: "white",
              fontFamily: Platform.select({
                android: 'Inter_600SemiBold',
                ios: 'Inter-SemiBold',
              }),
            }}
          >
            Visualize It
          </Text>
        </Pressable>
      :
        <View
          style={{
            borderRadius: 100,
            backgroundColor: "#7F56D9",
            paddingVertical: 10,
            width: "100%",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: "white",
              fontFamily: Platform.select({
                android: 'Inter_600SemiBold',
                ios: 'Inter-SemiBold',
              }),
            }}
          >
            Visualizing...
          </Text>
        </View>
      }
      </BottomSheetView>
    </BottomSheet>
  );
});


function TrashIcon() {
  return (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none" strokeWidth={1.5}>
      <Path d="M3 6H21" stroke="#7F56D9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <Path d="M19 6V20C19 21 18 22 17 22H7C6 22 5 21 5 20V6" stroke="#7F56D9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <Path d="M8 6V4C8 3 9 2 10 2H14C15 2 16 3 16 4V6" stroke="#7F56D9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <Path d="M10 11V17" stroke="#7F56D9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      <Path d="M14 11V17" stroke="#7F56D9" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
    </Svg>
  )
}

