import _ from "lodash";
import React, { useRef } from "react";
import { StyleSheet, TextInput, TextInputProps, TextStyle } from "react-native";
import Theme from "../../theme";
import Text from "../Text";

export type IInputType =
  | "text"
  | "number"
  | "password"
  | "decimal"
  | "multiline"
  | "currency";
export interface IInputProps extends TextInputProps {
  type?: IInputType;
  editable?: boolean;
}

export default (props: IInputProps) => {
  let { type, onChangeText, value, editable, style } = props;
  const originalType = useRef(type);
  const onChange = (e: any) => {
    let v;
    switch (originalType.current) {
      default:
        v = e;
        break;
      case "number":
        v = parseInt(e || "0");
        break;
      case "decimal":
        v = parseFloat(e);
        break;
      case "currency":
        v = parseInt(e.replace(/[^0-9]/g, "") || "0");
        // .toString()
        // .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        break;
    }

    onChangeText && onChangeText(v);
  };
  const baseStyle: TextStyle = {
    fontSize: Theme.UIFontSize,
    fontFamily: Theme.UIFontFamily,
    color: Theme.UIColors.text,
    paddingHorizontal: 10,
  };
  const cstyle = StyleSheet.flatten([
    baseStyle,
    // Theme.UIInput,
    style,
    {
      opacity: editable !== false ? 1 : 0.7,
    },
  ]);

  if (!!value && typeof value === "object") {
    return <Text>{JSON.stringify(value)}</Text>;
  }

  const cprops = { ...props, onChangeText: onChange };

  if (
    typeof value === "number" &&
    type !== "number" &&
    type !== "decimal" &&
    type !== "currency"
  ) {
    originalType.current = "number";
    value = !!value || value == 0 ? String(value) : "";
  }

  if (type === "currency") {
    if (value !== undefined)
      value = value
        .toString()
        .replace(/,/g, "")
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  let ComponentProps: any = {
    returnKeyType: "next",
    ...cprops,
    style: cstyle,
    value: !!value ? value : "",
    placeholder: _.get(cprops, "placeholder", ""),
  };

  let Component = TextInput;

  switch (type) {
    case "password":
      ComponentProps = {
        ...ComponentProps,
        secureTextEntry: true,
      };
      break;
    case "decimal":
    case "number":
      ComponentProps = {
        keyboardType: "number-pad",
        ...ComponentProps,
        value: !!value || value == "0" ? String(value) : "",
      };
      break;
    case "multiline":
      ComponentProps = {
        numberOfLines: 4,
        ...ComponentProps,
        multiline: true,
        style: {
          ...ComponentProps.style,
          height: undefined,
          minHeight: 100,
        },
      };
      break;
    case "currency":
      ComponentProps = {
        keyboardType: "number-pad",
        ...ComponentProps,
      };
      break;
  }

  return <Component placeholderTextColor={"#999"} {...ComponentProps} />;
};
