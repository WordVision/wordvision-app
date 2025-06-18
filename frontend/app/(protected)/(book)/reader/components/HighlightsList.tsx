/* eslint-disable react/no-unused-prop-types */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { forwardRef, useCallback, useMemo } from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { Annotation, Section, useReader } from '@epubjs-react-native/core';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';

interface Props {
  onPressItem: (annotation: Annotation) => void;
  onClose: () => void;
}
export type Ref = BottomSheetModalMethods;

export const HighlightsList = forwardRef<Ref, Props>(({ onPressItem, onClose }, ref) => {

    const { theme, annotations } = useReader();
    const snapPoints = useMemo(() => ['70%', '100%'], []);

    const renderItem = useCallback(({ item }: { item: Annotation }) => (
        <Pressable
          key={item.cfiRange}
          style={({pressed}) => ({
            backgroundColor: pressed ? "#fff" : "#dbdbdb",
            marginVertical: 2,
            marginHorizontal: 24,
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 5
          })}
          onPress={() => onPressItem(item)}
        >
          <View>
            <Text
              style={{
                color: "black",
              }}
              numberOfLines={2}
            >
              &quot;{item.cfiRangeText}&quot;
            </Text>
          </View>
        </Pressable>
      ),
      [onPressItem]
    );

    const header = useCallback(() => (
        <View style={{
          width: '100%',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginVertical: 10,
          paddingHorizontal: 24
        }}>
          <Text style={{
            fontSize: 24
          }}>
            Highlights
          </Text>

          <Pressable onPress={onClose}>
            <Text style={{
              fontSize: 16
            }}>Close</Text>
          </Pressable>
        </View>
      ),
      [onClose, annotations]
    );

    return (

      <BottomSheetModalProvider>
        <BottomSheetModal
          ref={ref}
          index={0}
          snapPoints={snapPoints}
          enablePanDownToClose
          style={{
            ...styles.container,
            backgroundColor: theme.body.background,
          }}
          handleStyle={{ backgroundColor: theme.body.background }}
          backgroundStyle={{ backgroundColor: theme.body.background }}
        >
          <BottomSheetFlatList
            data={annotations.filter(
              (annotation) =>
                !annotation?.data?.isTemp && annotation.type !== 'mark'
            )}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.cfiRange}
            renderItem={renderItem}
            ListHeaderComponent={header}
            style={{ width: '100%' }}
            maxToRenderPerBatch={20}
          />
        </BottomSheetModal>
      </BottomSheetModalProvider>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  input: {
    width: '100%',
    borderRadius: 10,
    fontSize: 16,
    lineHeight: 20,
    padding: 8,
    backgroundColor: 'rgba(151, 151, 151, 0.25)',
  },
});
