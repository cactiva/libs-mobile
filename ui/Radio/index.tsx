import { textStyle } from "@src/libs/utils";
import { observer } from "mobx-react-lite";
import React from "react";
import {
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from "react-native";
import Svg, { Circle } from "react-native-svg";
import { DefaultTheme, ThemeProps } from "../../themes";
import Icon from "../Icon";
import Theme from "@src/libs/theme";

export type RadioModeType = "default" | "checkbox" | "button";

export interface RadioProps {
  text?: string;
  value?: any;
  mode?: RadioModeType;
  checked?: boolean;
  onPress?: (value: boolean) => void;
  style?: ViewStyle;
  textStyle?: TextStyle;
  theme?: ThemeProps;
}

export default observer((props: RadioProps) => {
  const { text, onPress, value, mode } = props;
  const checked = props.checked === true ? true : false;

  const basetstyle = {
    color: Theme.UIColors.text,
  };
  const tStyle = StyleSheet.flatten([basetstyle, props.textStyle]);
  const baseStyle = {
    margin: 5,
    padding: 5,
    flexDirection: "row",
    alignItems: "center",
  };
  const btnStyle =
    mode === "button"
      ? {
          borderColor: Theme.UIColors.primary,
          borderWidth: 1,
        }
      : {};
  const btnActiveStyle =
    mode === "button"
      ? {
          backgroundColor: Theme.UIColors.primary,
        }
      : {};
  const style = StyleSheet.flatten([
    baseStyle,
    btnStyle,
    btnActiveStyle,
    props.style,
  ]);
  // if (!!style)
  //   Object.keys(style).map((k) => {
  //     if (Object.keys(tStyle).indexOf(k) > -1) delete style[k];
  //   });
  return (
    <TouchableOpacity
      style={style}
      onPress={() => {
        onPress && onPress(!checked);
      }}
    >
      {mode === "checkbox" ? (
        <View
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 5,
            backgroundColor: checked ? Theme.UIColors.primary : "#fff",
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: checked
              ? Theme.UIColors.primary
              : Theme.UIColors.secondary,
            width: 20,
            height: 20,
            borderRadius: 4,
            marginRight: 8,
          }}
        >
          <Icon
            source="Entypo"
            name="check"
            size={16}
            color={checked ? "white" : Theme.UIColors.primary}
          />
        </View>
      ) : (
        (mode === "default" || !mode) && (
          <Icon
            name={checked ? "md-radio-button-on" : "md-radio-button-off"}
            size={24}
            color={checked ? Theme.UIColors.primary : Theme.UIColors.text}
          />
        )
      )}
      <Text style={tStyle}>{text}</Text>
    </TouchableOpacity>
  );
});
