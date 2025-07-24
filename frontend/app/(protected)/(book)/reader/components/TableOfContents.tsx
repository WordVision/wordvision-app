/* eslint-disable react/no-unused-prop-types */
/* eslint-disable @typescript-eslint/no-use-before-define */
import React, { forwardRef, useCallback, useMemo } from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { Section, useReader } from '@epubjs-react-native/core';
import {
  BottomSheetModal,
  BottomSheetModalProvider,
  BottomSheetFlatList,
} from '@gorhom/bottom-sheet';
import { BottomSheetModalMethods } from '@gorhom/bottom-sheet/lib/typescript/types';

interface Props {
  onPressSection: (section: Section) => void;
  onClose: () => void;
}
export type Ref = BottomSheetModalMethods;

export const TableOfContents = forwardRef<Ref, Props>(({ onPressSection, onClose }, ref) => {

    const { toc, section, theme } = useReader();
    const snapPoints = useMemo(() => ['70%', '100%'], []);

    const renderItem = useCallback(({ item }: { item: Section }) => (
        <Pressable
          key={item.id}
          style={({pressed}) => ({
            backgroundColor: pressed ? "#fff" : "#dbdbdb",
            marginVertical: 2,
            marginHorizontal: 24,
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 5
          })}
          onPress={() => onPressSection(item)}
        >
          <View>
            <Text
              style={{
                color: section?.id === item.id
                  ? "red"
                  : "black",
              }}
            >
              {item.label}
            </Text>
          </View>
        </Pressable>
      ),
      [onPressSection, section?.id]
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
            Table of Contents
          </Text>

          <Pressable onPress={onClose}>
            <Text style={{
              fontSize: 16
            }}>Close</Text>
          </Pressable>
        </View>
      ),
      [onClose, toc]
    );

    return (
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
          data={toc}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          ListHeaderComponent={header}
          style={{ width: '100%' }}
          maxToRenderPerBatch={20}
        />
      </BottomSheetModal>
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
