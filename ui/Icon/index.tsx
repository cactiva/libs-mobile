import * as IconSource from "@expo/vector-icons";
import React from "react";

export interface IconProps {
  source:
    | "AntDesign"
    | "Entypo"
    | "EvilIcons"
    | "Feather"
    | "FontAwesome"
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
  style?: any;
}
export default ({ source, name, size, color, style }: IconProps) => {
  const Icon: any = (IconSource as any)[source];

  return <Icon name={name} size={size} color={color} style={style} />;
};
