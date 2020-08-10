import React from "react";
import {
  Animated,
  KeyboardAvoidingView,
  KeyboardAvoidingViewProps,
  ScrollViewProps,
  StyleSheet,
  View,
  ViewProps as OriViewProps,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Theme from "../../theme";
import { SafeAreaView } from "react-native";
import { observer } from "mobx-react-lite";

export interface IViewProps
  extends OriViewProps,
    ScrollViewProps,
    KeyboardAvoidingViewProps {
  type?:
    | "View"
    | "SafeAreaView"
    | "AnimatedView"
    | "ScrollView"
    | "KeyboardAvoidingView";
  shadow?: boolean;
  childRef?: any;
  children?: any;
}

export default observer((props: IViewProps) => {
  const { type, shadow, style, childRef } = props;
  const shadowStyle = !!shadow ? Theme.UIShadow : {};
  let cstyle = StyleSheet.flatten([shadowStyle, style]);

  switch (type) {
    case "AnimatedView":
      return <Animated.View {...props} style={cstyle} />;
    case "ScrollView":
      return (
        <ScrollView
          {...props}
          ref={childRef}
          keyboardShouldPersistTaps={"handled"}
          style={cstyle}
        />
      );
    case "SafeAreaView":
      return <SafeAreaView {...props} style={cstyle} ref={childRef} />;
      break;
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
});
