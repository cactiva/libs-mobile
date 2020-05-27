import React from "react";
import {
  TextProps as OriginTextProps,
  Text,
  StyleSheet,
  TextStyle
} from "react-native";
import _ from "lodash";
import Theme from "../../theme";

export interface ITextProps extends OriginTextProps {
  children: any;
  color?: "white" | "black" | string;
}

export default (props: ITextProps) => {
  const { style, color } = props;
  const baseStyle: TextStyle = {
    // fontFamily: Theme.UIFontFamily,
    fontSize: Theme.UIFontSize,
    color: color || Theme.UIColors.text
  };
  const cstyle = StyleSheet.flatten([baseStyle, style]);

  return <Text {...props} style={cstyle} />;
};
