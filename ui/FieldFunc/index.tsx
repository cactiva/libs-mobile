import _ from "lodash";
import { observer } from "mobx-react-lite";
import React, { useState, useEffect, ComponentElement, Component } from "react";
import { StyleSheet, TextStyle, ViewStyle } from "react-native";
import Theme from "../../theme";
import Camera from "../Camera";
import CheckboxGroup from "../CheckboxGroup";
import Input from "../Input";
import RadioGroup from "../RadioGroup";
import Select from "../Select";
import Text from "../Text";
import View from "../View";
import Button from "../Button";
import Icon from "../Icon";
import { IInitializeForm } from "../FormFunc";

interface IFieldProps {
  label?: string;
  hiddenLabel?: boolean;
  path: string;
  value?: string | number | null | undefined;
  onChange?: (path: string, value: any) => void;
  children?: any;
  isRequired?: boolean;
  readonly?: boolean;
  validate?: string[];
  onBlur?: () => void;
  style?: ViewStyle;
  prefix?: any;
  suffix?: any;
  disableBoxStyle?: Boolean;
  styles?: {
    label?: TextStyle;
    wrapper?: ViewStyle;
    input?: TextStyle;
  };
  initialize?: IInitializeForm;
  hiddenField?: boolean;
  helpText?: any[];
}

export default observer((props: IFieldProps) => {
  let {
    path,
    label,
    readonly,
    style,
    prefix,
    suffix,
    disableBoxStyle,
    isRequired,
    hiddenLabel,
    initialize,
    hiddenField,
    helpText,
  } = props;
  const childprops = _.clone(_.get(props, "children.props", {}));
  const [password, setPassword] = useState(true);
  const Component = props.children.type;
  const fieldStyle = StyleSheet.flatten([Theme.UIField, style]);
  const defLabelStyle: TextStyle = {
    fontSize: Theme.UIFontSize,
    color: Theme.UIColors.primary,
    marginBottom: 5,
  };
  const labelStyle = StyleSheet.flatten([
    defLabelStyle,
    Theme.UILabel,
    _.get(props, "styles.label"),
  ]);
  const defErrorLabelStyle: TextStyle = {
    fontSize: 12,
    lineHeight: 14,
    color: Theme.UIColors.danger,
    paddingVertical: 5,
  };
  const errorLabelStyle = StyleSheet.flatten([
    defErrorLabelStyle,
    Theme.UILabel,
  ]);
  const helpTextStyle = {
    fontSize: 12,
    lineHeight: 14,
    color: "#333",
    paddingVertical: 5,
  };
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
    _.get(props, "styles.wrapper"),
  ]);
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
  const inputStyle = StyleSheet.flatten([
    baseInpStyle,
    childprops.style,
    _.get(props, "styles.input"),
  ]);

  const handleOnChange = (value) => {
    if (!!initialize && typeof initialize.setValue == "function") {
      initialize.setValue(path, value);
    }
    if (typeof props.onChange == "function") {
      props.onChange(path, value);
    }
  };

  let value;
  if (!!props.value) {
    value = props.value;
  } else if (!!initialize && typeof initialize.getValue == "function") {
    value = initialize.getValue(path);
  }
  if (!value) {
    value = "";
  }
  childprops.editable = !readonly;
  childprops.value = value;
  childprops.onChange = handleOnChange;
  childprops.onBlur = props.onBlur;

  switch (Component) {
    case Select:
      childprops.customProps = {
        label,
        ...childprops.customProps,
      };
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

  if (childprops.type === "password") {
    let exist = suffix;
    suffix = () => {
      return (
        <>
          <Button
            mode={"clean"}
            style={{
              paddingHorizontal: 0,
              minWidth: 35,
              width: 35,
              minHeight: 35,
              height: 35,
            }}
            onPress={() => {
              setPassword(!password);
            }}
          >
            <Icon name={!!password ? "md-eye-off" : "md-eye"} size={18} />
          </Button>
          {!!exist && typeof exist === "function" ? exist() : exist}
        </>
      );
    };
    childprops.type = !!password ? "password" : "text";
  }

  let errorMsg: string[] = [];
  if (Array.isArray(props.validate)) {
    errorMsg = props.validate;
  }
  if (!!initialize && typeof initialize.validate == "function") {
    errorMsg = initialize.validate(path);
  }

  useEffect(() => {
    if (!!initialize.field) {
      initialize.field(path, label, isRequired);
    }
    return () => {
      if (!!initialize.remove) {
        initialize.remove(path);
      }
    };
  }, []);

  if (hiddenField === true) {
    initialize.remove(path);
    return null;
  }
  return (
    <View style={fieldStyle}>
      {!!label && hiddenLabel != true && (
        <Text style={labelStyle}>
          {label} {!!isRequired && "*"}
        </Text>
      )}
      <View style={wrapperStyle}>
        {!!prefix && typeof prefix === "function" ? prefix() : prefix}
        <Component {...childprops} style={inputStyle} />
        {!!suffix && typeof suffix === "function" ? suffix() : suffix}
      </View>
      {Array.isArray(helpText) &&
        helpText.map((text, idx) => {
          if (typeof text === "string")
            return (
              <Text key={idx} style={helpTextStyle}>
                {text}
              </Text>
            );
          else return text;
        })}
      {Array.isArray(errorMsg) &&
        errorMsg.map((message, idx) => (
          <Text key={idx} style={errorLabelStyle}>
            {message}
          </Text>
        ))}
    </View>
  );
});
