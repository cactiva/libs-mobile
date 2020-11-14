import get from "lodash.get";
import { observer } from "mobx-react-lite";
import React from "react";
import { Platform, StyleSheet, ViewStyle } from "react-native";
import View, { IViewProps } from "../View";

export interface IContainerProps extends IViewProps {
  children?: any;
  scrollRef?: any;
  alert?: () => any;
  keyboardAvoidingProps?: IViewProps;
}

export default observer((props: IContainerProps) => {
  const { style, scrollRef, alert, keyboardAvoidingProps } = props;
  const baseStyle: ViewStyle = {
    flexGrow: 1,
  };

  const cstyle = StyleSheet.flatten([
    baseStyle,
    style,
    get(props, "contentContainerStyle", {}),
  ]);

  return (
    <View
      type={Platform.OS == "ios" ? "KeyboardAvoidingView" : "View"}
      style={{
        flexShrink: 1,
      }}
      {...keyboardAvoidingProps}
    >
      <View
        style={{
          backgroundColor: "transparent",
          position: "absolute",
          zIndex: 99,
        }}
      >
        {!!alert && alert()}
      </View>
      {get(props, "scrollEnabled", true) === false ? (
        <View {...props} style={cstyle} childRef={scrollRef} />
      ) : (
        <View
          type={"ScrollView"}
          {...props}
          style={cstyle}
          childRef={scrollRef}
          contentContainerStyle={cstyle}
        />
      )}
    </View>
  );
});
