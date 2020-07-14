import React from "react";
import { FlatList, FlatListProps, StyleSheet } from "react-native";

export interface IFlatListProps extends FlatListProps<any> {
  flatListRef?: any;
}
export default (props: IFlatListProps) => {
  const { contentContainerStyle, style } = props;
  const baseStyle = {
    flexGrow: 1,
    flexShrink: 1,
  };
  const basecontentContainerStyle = {
    padding: 5,
    paddingHorizontal: 15,
  };
  const cstyle = StyleSheet.flatten([baseStyle, style]);
  const ccontentContainerStyle = StyleSheet.flatten([
    basecontentContainerStyle,
    contentContainerStyle,
  ]);
  return (
    <FlatList
      windowSize={11}
      removeClippedSubviews={true}
      initialNumToRender={15}
      maxToRenderPerBatch={3}
      updateCellsBatchingPeriod={100}
      {...props}
      style={cstyle}
      contentContainerStyle={ccontentContainerStyle}
      ref={props.flatListRef}
    />
  );
};
