import Theme from "@src/theme.json";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React, { useRef } from "react";
import { TextInput, TextInputProps } from "react-native";
import { DefaultTheme } from "../../theme";
import Text from "../Text";

export type InputType =
  | "text"
  | "number"
  | "password"
  | "decimal"
  | "multiline"
  | "currency";
export interface InputProps extends TextInputProps {
  type?: InputType;
  currencyProps?: any;
}

export default observer((props: InputProps) => {
  let { type, onChangeText, value, currencyProps } = props;
  const originalType = useRef(type);
  const setValue = (e: any) => {
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
        v = parseInt(e.replace(/,/g, "") || "0").toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        break;
    }

    onChangeText && onChangeText(v);
  };
  const theme = {
    ...DefaultTheme,
    ...Theme.colors
  };
  let style = {
    minWidth: 10,
    borderWidth: 0,
    margin: 0,
    color: theme.dark,
    minHeight: 30,
    fontSize: Theme.fontSize,
    ...(_.get(props, "style", {}) as any)
  };

  const cprops = { ...props, onChangeText: setValue };

  if (typeof value === "number" && type !== "number" && type !== "decimal" && type !== "currency") {
    originalType.current = "number";
    value = !!value ? String(value) : "";
  }

  if (type === "currency") {
    if (value !== undefined)
      value = value.toString().replace(/,/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  let ComponentProps: TextInputProps = {
    returnKeyType: "next",
    ...cprops,
    style,
    value: !!value ? value : "",
    placeholder: _.get(cprops, "placeholder", "")
  };

  if (!!value && typeof value === "object") {
    return <Text>{JSON.stringify(value)}</Text>;
  }

  let Component = TextInput;

  switch (type) {
    case "password":
      ComponentProps = {
        ...ComponentProps,
        secureTextEntry: true
      };
      break;
    case "decimal":
    case "number":
      ComponentProps = {
        keyboardType: "number-pad",
        ...ComponentProps,
        value: !!value ? String(value) : ""
      };
      break;
    case "multiline":
      ComponentProps = {
        numberOfLines: 4,
        ...ComponentProps,
        multiline: true
      };
      break;
    case "currency":
      // delete ComponentProps.onChangeText;
      // ComponentProps = {
      //   locale: "id-ID",
      //   currency: "IDR",
      //   ...ComponentProps,
      //   ...currencyProps,
      //   type: "currency",
      //   onUpdate: setValue
      // };
      // Component = NumericInput;
      // break;
      ComponentProps = {
        keyboardType: "number-pad",
        ...ComponentProps
        // value: !!value ? String(value) : ""
      };
      break;
  }

  return <Component {...ComponentProps} />;
});
