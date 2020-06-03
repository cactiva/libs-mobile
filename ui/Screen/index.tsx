import Constants from "expo-constants";
import _ from "lodash";
import React from "react";
import {
  StyleSheet,
  ViewProps,
  ViewStyle,
  StatusBarStyle,
  StatusBar,
} from "react-native";
import Theme from "../../theme";
import View from "../View";

interface IStyles {
  statusbar?: ViewStyle;
}

export interface IScreenProps extends ViewProps {
  children?: any;
  styles?: IStyles;
  setBarStyle?: StatusBarStyle;
}

export default (props: IScreenProps) => {
  const { style, setBarStyle, children } = props;
  // const marginTop = Platform.OS === "android" ? -Constants.statusBarHeight : 0;
  let cstyle = StyleSheet.flatten([
    {
      flexGrow: 1,
      flexShrink: 1,
      backgroundColor: Theme.UIColors.background,
      padding: 0,
      margin: 0,
      // marginTop,
    },
    style,
  ]);
  const defStatusbarStyle: ViewStyle = {
    backgroundColor: _.get(
      props,
      "style.backgroundColor",
      Theme.UIColors.primary
    ),
    height: Constants.statusBarHeight,
    zIndex: 999,
  };
  const cstatusbarStyle = StyleSheet.flatten([
    defStatusbarStyle,
    _.get(props, "styles.statusbar", {}),
  ]);
  if (setBarStyle) StatusBar.setBarStyle(setBarStyle);
  return (
    <>
      <View style={cstatusbarStyle} />
      <View type={"SafeAreaView"} {...props} style={cstyle} />
    </>
  );
};
