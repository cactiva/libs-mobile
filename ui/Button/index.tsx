import _ from "lodash";
import React from "react";
import {
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from "react-native";
import Theme from "../../theme";
import Text from "../Text";

interface IStyles {
  disabled?: ViewStyle;
  label?: TextStyle;
}

export interface IButtonProps extends TouchableOpacityProps {
  shadow?: Boolean;
  type?: "Submit" | string;
  children?: any;
  mode?: "contained" | "outlined" | "clean";
  styles?: IStyles;
  label?: string;
  style?: ViewStyle;
}

export default (props: IButtonProps) => {
  const {
    disabled,
    shadow,
    style,
    mode = "contained",
    children,
    label,
  } = props;
  const cprops = _.clone(props);
  delete cprops.styles;
  const disabledStyle = {
    opacity: 0.5,
    ..._.get(props, "styles.disabled", {}),
  };
  const shadowStyle = !!shadow ? Theme.UIShadow : {};
  const containedStyle: ViewStyle = {
    backgroundColor: Theme.UIColors.primary,
  };
  const outlinedStyle: ViewStyle = {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: Theme.UIColors.primary,
    backgroundColor: "#fff",
  };
  const cleanStyle: ViewStyle = {
    backgroundColor: "transparent",
  };
  const cstyle: ViewStyle = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
    minWidth: 44,
    minHeight: 44,
    paddingHorizontal: 16,
    padding: 4,
    margin: 4,
    ...shadowStyle,
    ...(mode === "outlined"
      ? outlinedStyle
      : mode === "clean"
      ? cleanStyle
      : containedStyle),
    ...Theme.UIButton,
    ...style,
    ...(disabled !== true ? {} : disabledStyle),
  };
  return (
    <TouchableOpacity activeOpacity={0.6} {...cprops} style={cstyle}>
      {!children && !!label ? (
        <Text style={_.get(props, "styles.label", {})}>{label}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};
