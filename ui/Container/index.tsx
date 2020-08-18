import _ from "lodash";
import React from "react";
import { Platform, StyleSheet, ViewStyle } from "react-native";
import View, { IViewProps } from "../View";
import { observer } from "mobx-react-lite";

export interface IContainerProps extends IViewProps {
  children?: any;
  scrollRef?: any;
  alert?: () => any;
}

export default observer((props: IContainerProps) => {
  const { style, scrollRef, alert } = props;
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
      <View
        style={{
          backgroundColor: "transparent",
          position: "absolute",
          zIndex: 99,
        }}
      >
        {!!alert && alert()}
      </View>
      {_.get(props, "scrollEnabled", true) === false ? (
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
});
