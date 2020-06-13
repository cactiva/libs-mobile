import React from "react";
import { ScrollViewProps, StyleSheet, ViewStyle, Platform, StatusBar } from "react-native";
import View from "../View";
import _ from "lodash";

export interface IContainerProps extends ScrollViewProps {
  children?: any;
  scrollRef?: any;
  KeyboardAvoidingView?: boolean;
}

export default (props: IContainerProps) => {
  const { style, scrollRef, KeyboardAvoidingView } = props;
  const baseStyle: ViewStyle = {
    flexGrow: 1,
  };
  const cstyle = StyleSheet.flatten([baseStyle, style]);
  return (
    <View
      type={Platform.OS === "ios" ? "KeyboardAvoidingView" : "View"}
      style={{
        flex: 1,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 
      }}
    >
      <View
        type={"ScrollView"}
        {...props}
        style={{
          backgroundColor: "#ffffff"
        }}
        childRef={scrollRef}
        contentContainerStyle={cstyle}
      />
    </View>
  );
};
