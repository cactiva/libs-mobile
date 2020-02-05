import React from "react";
import View from "../View";
import Constants from "expo-constants";
import { ViewStyle, StyleSheet, ViewProps } from "react-native";
import Theme from "../../theme";

export interface IScreenProps extends ViewProps {
  children?: any;
  statusbarStyle?: any;
}

export default (props: IScreenProps) => {
  const { style, statusbarStyle } = props;
  const safeAreaStyle: ViewStyle = {
    flexGrow: 1,
    flexShrink: 1,
    backgroundColor: Theme.UIColors.background,
    padding: 0,
    margin: 0
  };
  let cstyle = StyleSheet.flatten([safeAreaStyle, style]);
  const defStatusbarStyle: ViewStyle = {
    backgroundColor: Theme.UIColors.primary,
    height: Constants.statusBarHeight,
    zIndex: 99
  };
  const cstatusbarStyle = StyleSheet.flatten([
    defStatusbarStyle,
    statusbarStyle
  ]);
  return (
    <>
      <View style={cstatusbarStyle} />
      <View {...props} style={cstyle} />
    </>
  );
};
