import React, { forwardRef, useCallback } from 'react';
import { View, Text, Platform, Image, Pressable } from 'react-native';
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';
import { Visualization } from '../types';
import Loading from '@/components/Loading';
import Icon from '@/components/Icon';

interface Props {
  onClose: () => void;
  onDelete: (v: Visualization) => void;
  onVisualizeEmptyHighlight: () => void;
  visualization?: Visualization;
  error?: string;
  deleting: boolean;
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
        gap: 12,
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

      : p.deleting ?

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
            backgroundColor: "#f3f4f6"
          }}
        >
          <Loading message='Deleting Visualization...'/>
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

      : p.deleting ?

        <View
          style={{
            borderRadius: 100,
            backgroundColor: "#b91c1c",
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
            Deleting...
          </Text>
        </View>

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
            onPress={() => p.onDelete(p.visualization!)}
          >
            <Icon name='trash'/>

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


