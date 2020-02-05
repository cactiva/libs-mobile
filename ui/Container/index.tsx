import React from "react";
import { ScrollViewProps, StyleSheet, ViewStyle } from "react-native";
import View from "../View";
import _ from "lodash";

export interface IContainerProps extends ScrollViewProps {
  children?: any;
  scrollRef?: any;
}

export default (props: IContainerProps) => {
  const { style, scrollRef } = props;
  const baseStyle: ViewStyle = {
    flexGrow: 1
  };
  const cstyle = StyleSheet.flatten([baseStyle, style]);
  return (
    <View
      type={"KeyboardAvoidingView"}
      style={{
        flexGrow: 1,
        flexShrink: 1
      }}
    >
      <View
        type={"ScrollView"}
        {...props}
        style={{
          flexGrow: 1,
          flexShrink: 1
        }}
        childRef={scrollRef}
        contentContainerStyle={cstyle}
      />
    </View>
  );
};
