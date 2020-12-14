import get from "lodash.get";
import { observer } from "mobx-react-lite";
import React, { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  KeyboardAvoidingViewProps,
  Platform,
  ScrollView,
  ScrollViewProps,
  StyleSheet,
  ViewStyle,
} from "react-native";
import View from "../View";

export interface IContainerProps extends ScrollViewProps {
  children?: ReactNode;
  alert?: () => any;
  keyboardAvoidingProps?: KeyboardAvoidingViewProps;
  scrollRef?: any;
  keyboardRef?: any;
}

export default observer((props: IContainerProps) => {
  const { style, scrollRef, alert, keyboardAvoidingProps, keyboardRef } = props;
  const baseStyle: ViewStyle = {
    flexGrow: 1,
  };

  const cstyle = StyleSheet.flatten([
    baseStyle,
    style,
    get(props, "contentContainerStyle", {}),
  ]);

  return (
    <KeyboardAvoidingView
      // type={Platform.OS == "ios" ? "KeyboardAvoidingView" : "View"}
      ref={keyboardRef}
      enabled={true}
      behavior={Platform.OS == "ios" ? "padding" : "height"}
      style={{
        flexGrow: 1,
        flexShrink: 1,
      }}
      {...keyboardAvoidingProps}
    >
      {!!alert && (
        <View
          style={{
            backgroundColor: "transparent",
            position: "absolute",
            zIndex: 99,
          }}
        >
          {alert()}
        </View>
      )}
      {get(props, "scrollEnabled", true) === false ? (
        <View {...props} style={cstyle} childRef={scrollRef} />
      ) : (
        <ScrollView
          {...props}
          style={cstyle}
          ref={scrollRef}
          contentContainerStyle={cstyle}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </KeyboardAvoidingView>
  );
});
