import React from "react";
import {
  TouchableOpacity,
  TouchableOpacityProps,
  StyleSheet,
  ViewStyle
} from "react-native";
import Theme from "../../theme";

export interface IButtonProps extends TouchableOpacityProps {
  shadow?: Boolean;
  type?: "Submit" | string;
  children?: any;
  mode?: "contained" | "outlined" | "clean";
}

export default (props: IButtonProps) => {
  const { disabled, shadow, style, mode = "contained" } = props;
  const disabledStyle = {
    opacity: !!disabled ? 0.5 : 1
  };
  const shadowStyle = !!shadow ? Theme.UIShadow : {};
  const baseStyle: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
    minWidth: 64,
    minHeight: 44,
    paddingLeft: 16,
    paddingRight: 16,
    padding: 4,
    margin: 4
  };
  const containedStyle: ViewStyle = {
    backgroundColor: Theme.UIColors.primary
  };
  const outlinedStyle: ViewStyle = {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: Theme.UIColors.primary,
    backgroundColor: "#fff"
  };
  const cleanStyle: ViewStyle = {
    backgroundColor: "#fff"
  };
  const cstyle = StyleSheet.flatten([
    baseStyle,
    disabledStyle,
    shadowStyle,
    mode === "outlined"
      ? outlinedStyle
      : mode === "clean"
      ? cleanStyle
      : containedStyle,
    style
  ]);
  return <TouchableOpacity activeOpacity={0.6} {...props} style={cstyle} />;
};
