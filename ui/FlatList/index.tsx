import { observer } from "mobx-react-lite";
import React from "react";
import { FlatList, FlatListProps, StyleSheet } from "react-native";

export default observer((props: FlatListProps<any>) => {
  const { contentContainerStyle, style } = props;
  const baseStyle = {
    flexGrow: 1,
    flexShrink: 1
  };
  const basecontentContainerStyle = {
    padding: 5,
    paddingLeft: 15,
    paddingRight: 15
  };
  const cstyle = StyleSheet.flatten([baseStyle, style]);
  const ccontentContainerStyle = StyleSheet.flatten([
    basecontentContainerStyle,
    contentContainerStyle
  ]);
  return (
    <FlatList
      initialNumToRender={20}
      maxToRenderPerBatch={20}
      windowSize={5}
      removeClippedSubviews={true}
      updateCellsBatchingPeriod={500}
      {...props}
      style={cstyle}
      contentContainerStyle={ccontentContainerStyle}
    />
  );
});
