import React, { forwardRef, useCallback } from 'react';
import { View, Text, Platform, Image } from 'react-native';
import BottomSheet, {
  BottomSheetView,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { BottomSheetMethods } from '@gorhom/bottom-sheet/lib/typescript/types';

interface Props {
  onClose: () => void;
}
export type Ref = BottomSheetMethods;

export const ImageVisualizer = forwardRef<Ref, Props>(({ onClose }, ref) => {

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        enableTouchThrough={false}
        onPress={onClose}
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

      <Image
        source={require("@/assets/images/purple_loading_image.gif")}
        style={{
          width: 320,
          height: 320,
          borderRadius: 12,
        }}
      />

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
        >Visualizing...</Text>
      </View>

      </BottomSheetView>
    </BottomSheet>
  );
});

