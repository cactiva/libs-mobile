import _ from "lodash";
import { observer } from "mobx-react-lite";
import React from "react";
import { StyleSheet, TextStyle, ViewStyle } from "react-native";
import Theme from "../../theme";
import Camera from "../Camera";
import CheckboxGroup from "../CheckboxGroup";
import Input from "../Input";
import RadioGroup from "../RadioGroup";
import Select from "../Select";
import Text from "../Text";
import View from "../View";

interface IFieldProps {
  label?: string;
  path?: string;
  setValue?: any;
  value?: any;
  children?: any;
  isRequired?: boolean;
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
  validate?: () => string[];
}

export default observer((props: IFieldProps) => {
  const {
    label,
    readonly,
    style,
    prefix,
    suffix,
    disableBoxStyle,
    validate,
    isRequired,
  } = props;
  const Component = props.children.type;
  const fieldStyle = StyleSheet.flatten([Theme.UIField, style]);
  const defLabelStyle: TextStyle = {
    fontSize: Theme.UIFontSize,
    color: Theme.UIColors.primary,
    marginBottom: 5,
  };
  const labelStyle = StyleSheet.flatten([defLabelStyle, Theme.UILabel]);
  const defErrorLabelStyle: TextStyle = {
    fontSize: 12,
    lineHeight: 12,
    color: Theme.UIColors.danger,
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
    props.setValue && props.setValue(value);
    props.onChange && props.onChange(value);
  };
  const childprops = _.clone(_.get(props, "children.props", {}));
  childprops.readonly = readonly;
  childprops.value = _.get(props, "value", "");
  childprops.onChange = handleOnChange;

  const baseInpStyle = {
    flexGrow: 1,
    height: 44,
  };
  if (
    Component === Camera ||
    Component === RadioGroup ||
    Component === CheckboxGroup
  ) {
    delete baseInpStyle.height;
  }
  const inputStyle = StyleSheet.flatten([baseInpStyle, childprops.style]);

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
  let errorMsg: string[] = [];
  if (!!validate) errorMsg = validate();

  return (
    <View style={fieldStyle}>
      {!!label && (
        <Text style={labelStyle}>
          {label} {!!isRequired && "*"}
        </Text>
      )}
      <View style={wrapperStyle}>
        {!!prefix && typeof prefix === "function" ? prefix() : prefix}
        <Component {...childprops} style={inputStyle} />
        {!!suffix && typeof suffix === "function" ? suffix() : suffix}
      </View>
      {Array.isArray(errorMsg) &&
        errorMsg.map((message, idx) => (
          <Text key={idx} style={errorLabelStyle}>
            {message}
          </Text>
        ))}
    </View>
  );
});
