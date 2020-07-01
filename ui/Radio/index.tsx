import _ from "lodash";
import React, { FunctionComponent } from "react";
import { StyleSheet, TextStyle, ViewStyle } from "react-native";
import Theme from "../../theme";
import Button from "../Button";
import Icon, { IIconProps } from "../Icon";
import Text, { ITextProps } from "../Text";
import { shadeColor } from "../../utils/color";

export type RadioModeType = "default" | "button";

interface IStyle {
  label?: TextStyle;
  selected?: {
    button?: ViewStyle;
    label?: TextStyle;
  };
}

export interface IRadioProps {
  label?: string;
  value?: any;
  mode?: RadioModeType;
  checked?: boolean;
  onPress?: (value: boolean) => void;
  style?: ViewStyle;
  styles?: IStyle;
  labelProps?: ITextProps;
  iconProps?: IIconProps | FunctionComponent;
  editable?: boolean;
}

export default (props: IRadioProps) => {
  const { label, onPress, mode, labelProps, iconProps, editable } = props;
  const checked = props.checked === true ? true : false;
  const baseLabelStyle = {
    color: Theme.UIColors.text,
  };
  const labelActiveStyle =
    mode === "button" && !!checked
      ? {
          color: Theme.UIColors.primary,
        }
      : {};
  const labelStyle = StyleSheet.flatten([
    baseLabelStyle,
    _.get(props, "labelProps.style", {}),
    _.get(props, "styles.label", {}),
    labelActiveStyle,
    !!checked && _.get(props, "styles.selected.label", {}),
  ]);
  const baseStyle = {
    margin: 0,
    marginRight: 10,
    marginBottom: 10,
    padding: 0,
    paddingHorizontal: mode === "button" ? 10 : 0,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: Theme.UIColors.primary,
  };
  const btnStyle =
    mode === "button"
      ? {
          ...Theme.UIInput,
          backgroundColor: "transparent",
        }
      : {};
  const btnActiveStyle =
    mode === "button" && !!checked
      ? {
          borderColor: Theme.UIColors.primary,
          backgroundColor: shadeColor(Theme.UIColors.primary, 190),
        }
      : {};
  const style: any = StyleSheet.flatten([
    baseStyle,
    btnStyle,
    _.get(props, "style", {}),
    btnActiveStyle,
    !!checked && _.get(props, "styles.selected.button", {}),
  ]);
  return (
    <Button
      mode={"clean"}
      shadow={mode === "button" && !!checked}
      onPress={() => {
        onPress && onPress(!checked);
      }}
      style={style}
      disabled={editable === false}
    >
      {mode === "default" || !mode || typeof iconProps === "object" ? (
        <Icon
          name={checked ? "md-radio-button-on" : "md-radio-button-off"}
          size={24}
          style={{
            height: 24,
          }}
          {...iconProps}
          color={checked ? Theme.UIColors.primary : Theme.UIColors.text}
        />
      ) : (
        iconProps
      )}
      <Text {...labelProps} style={labelStyle}>
        {label}
      </Text>
    </Button>
  );
};
