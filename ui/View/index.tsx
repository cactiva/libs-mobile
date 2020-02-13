import React from "react";
import {
  Animated,
  KeyboardAvoidingView,
  KeyboardAvoidingViewProps,
  ScrollViewProps,
  StyleSheet,
  View,
  ViewProps as OriViewProps
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { SafeAreaViewProps } from "react-navigation";
import Theme from "../../theme";

export interface IViewProps
  extends OriViewProps,
    ScrollViewProps,
    SafeAreaViewProps,
    KeyboardAvoidingViewProps {
  type?:
    | "View"
    | "SafeAreaView"
    | "AnimatedView"
    | "ScrollView"
    | "KeyboardAvoidingView";
  shadow?: boolean;
  childRef?: any;
}

export default (props: IViewProps) => {
  const { type, shadow, style, childRef } = props;
  const shadowStyle = !!shadow ? Theme.UIShadow : {};
  let cstyle = StyleSheet.flatten([shadowStyle, style]);

  switch (type) {
    case "AnimatedView":
      return <Animated.View ref={childRef} {...props} style={cstyle} />;
    case "ScrollView":
      return (
        <ScrollView
          {...props}
          ref={childRef}
          keyboardShouldPersistTaps={"handled"}
          style={cstyle}
        />
      );
    case "KeyboardAvoidingView":
      return (
        <KeyboardAvoidingView
          behavior="padding"
          enabled
          {...props}
          ref={childRef}
          style={cstyle}
        />
      );
    default:
      return <View {...props} style={cstyle} ref={childRef} />;
  }
};
