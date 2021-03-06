import * as IconSource from "@expo/vector-icons";
import React from "react";
import { ViewStyle, StyleSheet } from "react-native";

export interface IIconProps {
  source?:
    | "AntDesign"
    | "Entypo"
    | "EvilIcons"
    | "Feather"
    | "Fontisto"
    | "FontAwesome"
    | "FontAwesome5"
    | "Foundation"
    | "Ionicons"
    | "MaterialCommunityIcons"
    | "MaterialIcons"
    | "Octicons"
    | "SimpleLineIcons"
    | "Zocial";
  name: string;
  size?: number;
  color?: string;
  style?: ViewStyle;
}
export default (props: IIconProps) => {
  const { source, style, size } = props;
  const CompIcon: any = (IconSource as any)[source || "Ionicons"];
  const baseStyle = {
    margin: 4,
  };
  const cstyle = StyleSheet.flatten([baseStyle, style]);
  const csize = size || 20;

  return <CompIcon {...props} size={csize} style={cstyle} />;
};
