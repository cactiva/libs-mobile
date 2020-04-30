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
      initialNumToRender={20}
      maxToRenderPerBatch={20}
      windowSize={5}
      removeClippedSubviews={true}
      updateCellsBatchingPeriod={30}
      {...props}
      style={cstyle}
      contentContainerStyle={ccontentContainerStyle}
      ref={props.flatListRef}
    />
  );
};
