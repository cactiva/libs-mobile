import React from "react";
import View from "../View";
import Constants from "expo-constants";
import {
  ViewStyle,
  StyleSheet,
  ViewProps,
  StatusBar,
  Platform,
} from "react-native";
import Theme from "../../theme";
import _ from "lodash";

interface IStyles {
  statusbar?: ViewStyle;
}

export interface IScreenProps extends ViewProps {
  children?: any;
  styles?: IStyles;
}

export default (props: IScreenProps) => {
  const { style } = props;
  const marginTop = Platform.OS === "android" ? -Constants.statusBarHeight : 0;
  let cstyle = StyleSheet.flatten([
    {
      flexGrow: 1,
      flexShrink: 1,
      backgroundColor: Theme.UIColors.background,
      padding: 0,
      margin: 0,
      marginTop,
    },
    style,
  ]);
  const defStatusbarStyle: ViewStyle = {
    backgroundColor: Theme.UIColors.primary,
    height: Constants.statusBarHeight,
    zIndex: 999,
  };
  const cstatusbarStyle = StyleSheet.flatten([
    defStatusbarStyle,
    _.get(props, "styles.statusbar", {}),
  ]);
  return (
    <>
      <View style={cstatusbarStyle} />
      <View type={"SafeAreaView"} {...props} style={cstyle} />
    </>
  );
};
