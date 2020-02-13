import Theme from "@src/theme.json";
import _ from "lodash";
import { observer } from "mobx-react-lite";
import React from "react";
import { TouchableOpacity, TouchableOpacityProps } from "react-native";
import { DefaultTheme } from "../../theme";

interface ButtonStyles {
  wrapper?: any;
  label?: any;
}

export interface ButtonProps extends TouchableOpacityProps {
  shadow?: Boolean;
  type?: "submit" | string;
  children?: any;
}

export default observer((props: ButtonProps) => {
  const { disabled, shadow } = props;
  const theme = {
    ...DefaultTheme,
    ...Theme.colors
  };
  const styleShadow = {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,

    elevation: 6
  };
  return (
    <TouchableOpacity
      {...props}
      style={{
        backgroundColor: theme.primary,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: disabled ? 0.7 : 1,
        borderRadius: 4,
        minWidth: 30,
        padding: 10,
        ...(_.get(props, "style", {}) as any),
        ...(shadow ? styleShadow : {})
      }}
    ></TouchableOpacity>
  );
});
