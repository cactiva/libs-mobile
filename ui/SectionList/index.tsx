import { observer } from "mobx-react";
import React from "react";
import { SectionList, SectionListProps, StyleSheet } from "react-native";

export interface ISectionListProps extends SectionListProps<any> {
  sectionListRef?: any;
}
export default observer((props: ISectionListProps) => {
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
    <SectionList
      windowSize={21}
      removeClippedSubviews={true}
      initialNumToRender={30}
      maxToRenderPerBatch={40}
      updateCellsBatchingPeriod={80}
      {...props}
      style={cstyle}
      contentContainerStyle={ccontentContainerStyle}
      ref={props.sectionListRef}
    />
  );
});
