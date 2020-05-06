import _ from "lodash";
import React from "react";
import { Platform, StyleSheet, ViewStyle } from "react-native";
import View, { IViewProps } from "../View";

export interface IContainerProps extends IViewProps {
  children?: any;
  scrollRef?: any;
}

export default (props: IContainerProps) => {
  const { style, scrollRef } = props;
  const baseStyle: ViewStyle = {
    flexGrow: 1,
  };
  const cstyle = StyleSheet.flatten([
    baseStyle,
    style,
    _.get(props, "contentContainerStyle", {}),
  ]);

  return (
    <View
      type={Platform.OS === "ios" ? "KeyboardAvoidingView" : "View"}
      style={{
        flexGrow: 1,
        flexShrink: 1,
      }}
    >
      {!_.get(props, "scrollEnabled", false) ? (
        <View {...props} style={cstyle} childRef={scrollRef} />
      ) : (
        <View
          type={"ScrollView"}
          {...props}
          style={{
            flexGrow: 1,
            flexShrink: 1,
          }}
          childRef={scrollRef}
          contentContainerStyle={cstyle}
        />
      )}
    </View>
  );
};
