import React from "react";
import { StyleSheet, TextStyle, ViewStyle } from "react-native";
import Theme from "../../theme";
import Button from "../Button";
import Icon from "../Icon";
import Text, { ITextProps } from "../Text";
import View from "../View";
import _ from "lodash";

export type CheckboxType = "default" | "button";

interface IStyle {
  label?: TextStyle;
  selected?: ViewStyle;
}

export interface ICheckboxProps {
  label?: string;
  value?: any;
  mode?: CheckboxType;
  checked?: boolean;
  onPress?: (value: boolean) => void;
  style?: ViewStyle;
  styles?: IStyle;
  labelProps?: ITextProps;
}

export default (props: ICheckboxProps) => {
  const { label, onPress, mode, labelProps } = props;
  const checked = props.checked === true ? true : false;
  const baseLabelStyle = {
    color: Theme.UIColors.text,
  };
  const labelStyle = StyleSheet.flatten([
    baseLabelStyle,
    _.get(props, "labelProps.style", {}),
    _.get(props, "styles.label", {}),
  ]);
  const baseStyle = {
    margin: 0,
    marginRight: 10,
    marginBottom: 10,
    padding: 0,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
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
          backgroundColor: "#fff",
        }
      : {};
  const style: any = StyleSheet.flatten([
    baseStyle,
    btnStyle,
    props.style,
    btnActiveStyle,
  ]);
  return (
    <Button
      mode={"clean"}
      onPress={() => {
        onPress && onPress(!checked);
      }}
      style={style}
    >
      {(mode === "default" || !mode) && (
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: !!checked ? Theme.UIColors.primary : "#fff",
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: Theme.UIColors.primary,
            width: 20,
            height: 20,
            borderRadius: 4,
            marginRight: 8,
          }}
        >
          <Icon
            source="Entypo"
            name="check"
            size={14}
            color={"white"}
            style={{
              margin: 0,
            }}
          />
        </View>
      )}
      <Text {...labelProps} style={labelStyle}>
        {label}
      </Text>
    </Button>
  );
};
