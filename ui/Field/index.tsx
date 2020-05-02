import _ from "lodash";
import React, { useEffect, useState } from "react";
import { StyleSheet, TextStyle, ViewStyle } from "react-native";
import Theme from "../../theme";
import Camera from "../Camera";
import Input from "../Input";
import RadioGroup from "../RadioGroup";
import Select from "../Select";
import Text from "../Text";
import View from "../View";
import CheckboxGroup from "../CheckboxGroup";

interface IFieldProps {
  label?: string;
  path?: string;
  setValue?: any;
  value?: any;
  children?: any;
  isRequired?: boolean;
  isValid?: boolean;
  readonly?: boolean;
  onChange?: (value) => void;
  style?: ViewStyle;
  prefix?: any;
  suffix?: any;
  disableBoxStyle?: Boolean;
  styles?: {
    wrapper?: ViewStyle;
    input?: ViewStyle;
  };
}

export default (props: IFieldProps) => {
  const {
    label,
    isValid,
    readonly,
    style,
    prefix,
    suffix,
    disableBoxStyle,
  } = props;
  const Component = props.children.type;
  const [meta, setMeta] = useState({
    error: false,
    init: true,
  });
  const fieldStyle = StyleSheet.flatten([Theme.UIField, style]);
  const defLabelStyle: TextStyle = {
    fontSize: Theme.UIFontSize,
    color: Theme.UIColors.primary,
    marginBottom: 5,
  };
  const labelStyle = StyleSheet.flatten([defLabelStyle, Theme.UILabel]);
  const defErrorLabelStyle: TextStyle = {
    fontSize: 12,
    color: Theme.UIColors.danger,
    marginBottom: 5,
  };
  const errorLabelStyle = StyleSheet.flatten([
    defErrorLabelStyle,
    Theme.UILabel,
  ]);

  const boxStyle =
    Component === Camera ||
    Component === RadioGroup ||
    Component === CheckboxGroup ||
    disableBoxStyle === true
      ? {
          backgroundColor: "transparent",
          borderWidth: 0,
          borderRadius: 0,
          paddingHorizontal: 0,
        }
      : {};
  const wrapperStyle = StyleSheet.flatten([
    {
      flexDirection: "row",
      alignItems: "stretch",
    },
    Theme.UIInput,
    boxStyle,
    _.get(props, "styles.input"),
  ]);

  const handleOnChange = (value) => {
    props.setValue(value);
    props.onChange && props.onChange(value);
  };
  const childprops = _.clone(_.get(props, "children.props", {}));
  childprops.readonly = readonly;
  childprops.value = _.get(props, "value", "");
  childprops.onChange = handleOnChange;

  const inputStyle = StyleSheet.flatten([
    {
      flexGrow: 1,
      height: 44,
    },
    (Component === Camera ||
      Component === RadioGroup ||
      Component === CheckboxGroup) && {
      height: undefined,
    },
    childprops.style,
  ]);

  switch (Component) {
    case Select:
      childprops.searchProps = {
        placeholder: "Search " + props.label,
      };
      break;
    case Camera:
      delete childprops.onChange;
      childprops.onCapture = handleOnChange;
      break;
    case Input:
      delete childprops.onChange;
      childprops.onChangeText = handleOnChange;
      break;
  }

  useEffect(() => {
    if (!meta.init) {
      meta.error = !isValid;
      setMeta({ ...meta });
    }
  }, [isValid]);
  useEffect(() => {
    meta.init = false;
    setMeta({ ...meta });
  }, []);
  return (
    <View style={fieldStyle}>
      {!!label && <Text style={labelStyle}>{label}</Text>}
      <View style={wrapperStyle}>
        {!!prefix && typeof prefix === "function" ? prefix() : prefix}
        <Component {...childprops} style={inputStyle} />
        {!!suffix && typeof suffix === "function" ? suffix() : suffix}
      </View>
      {!!meta.error && <Text style={errorLabelStyle}>Field is required.</Text>}
    </View>
  );
};
