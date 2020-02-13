import Theme from "@src/libs/theme";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect } from "react";
import { Platform, Text, View as ViewNative } from "react-native";
import { ThemeProps } from "../../themes";
import { textStyle, uuid } from "../../utils";
import Camera, { CameraProps } from "../Camera";
import { CheckboxProps } from "../Checkbox";
import { CheckboxGroupProps } from "../CheckboxGroup";
import DatePicker, { DateTimeProps } from "../DatePicker";
import DateTime from "../DateTime";
import Icon, { IconProps } from "../Icon";
import Input, { InputProps } from "../Input";
import { LocationProps } from "../Location";
import { RadioProps } from "../Radio";
import RadioGroup, { RadioGroupProps } from "../RadioGroup";
import Select, { SelectProps } from "../Select";

interface StylesFieldProps {
  root?: any;
  label?: any;
  field?: any;
  iconStart?: any;
  iconEnd?: any;
}

const View: any =
  Platform.OS === "web" ? (props: any) => <div {...props} /> : ViewNative;

export interface FieldProps {
  label?: string;
  isLabel?: boolean;
  path?: string;
  field?:
    | InputProps
    | SelectProps
    | DateTimeProps
    | RadioGroupProps
    | RadioProps
    | CheckboxGroupProps
    | CheckboxProps
    | CameraProps
    | LocationProps;
  value?: any;
  setValue?: (value: any) => void;
  onChange?: (value: any) => void;
  iconStart?: IconProps;
  iconEnd?: IconProps;
  theme?: ThemeProps;
  style?: any;
  styles?: StylesFieldProps;
  children?: any;
  isRequired?: boolean;
  isValidate?: boolean;
  isValid?: (status: boolean) => void;
  isFocus?: Boolean;
  validate?: (value: any) => void;
  enableBorder?: boolean;
}

export default observer((props: FieldProps) => {
  if (!props.children) return null;

  const {
    value,
    setValue,
    onChange,
    label,
    iconStart,
    iconEnd,
    styles,
    children,
    isRequired,
    validate,
    isLabel,
    isValidate,
    isValid,
    isFocus,
    enableBorder
  } = props;
  let field = props.field;
  const meta = useObservable({
    focus: false,
    validate: false,
    error: false,
    errorMessage: []
  });
  let labelText =
    isLabel == false || !label ? "" : label + (isRequired ? " *" : "");
  const isIconStart =
    !!iconStart && !!iconStart.source && !!iconStart.name ? true : false;
  const isIconEnd =
    !!iconEnd && !!iconEnd.source && !!iconEnd.name ? true : false;
  const placeholder =
    !meta.error && !meta.focus ? _.get(children, "props.placeholder", "") : "";

  const onChangeValue = newValue => {
    validation(newValue);
    setValue && setValue(newValue);
    onChange && onChange(newValue);
  };
  const validation = value => {
    if (isRequired && !value) {
      meta.error = true;
      meta.errorMessage = [`${label} is required!`];
    }
    if (meta.error && !!value) {
      meta.error = false;
      meta.errorMessage = [];
    }
    if (!meta.validate) meta.validate = true;
    if (validate) {
      let res: any = validate(value);
      if (res !== false && res !== undefined && res !== null) {
        meta.error = true;
        meta.errorMessage = res;
      } else {
        meta.error = false;
        meta.errorMessage = [];
      }
    }
    isValid && isValid(!meta.error);
  };

  const fieldType = children.type;
  const childStyle = { ..._.get(children, "props.style", {}), flex: 1 };
  let childProps;
  switch (fieldType) {
    case DateTime:
      childProps = {
        style: childStyle,
        value: value,
        onChange: (e: Date) => {
          try {
            onChangeValue(e.toISOString());
          } catch (e) {}
        }
      };
      break;
    case Input:
      childProps = {
        style: childStyle,
        value: value,
        onChangeText: onChangeValue,
        placeholder: placeholder,
        onFocus: () => (meta.focus = true),
        onBlur: () => (meta.focus = false)
      };
      break;
    case Select:
      childProps = {
        style: childStyle,
        value: value,
        placeholder: placeholder,
        onSelect: value =>
          onChangeValue(
            typeof value !== "object" ? value : value.value || value.label
          ),
        onFocus: (e: any) => (meta.focus = e)
      };
      break;
    case DatePicker:
      childProps = {
        style: childStyle,
        value: value,
        onChange: value => onChangeValue(value),
        onFocus: (e: any) => (meta.focus = e)
      };
      break;
    case RadioGroup:
      childProps = {
        onChange: onChangeValue,
        value: value,
        children: children.props.children
      };
      break;
    case "checkbox-group":
      childProps = {
        onChange: onChangeValue,
        value: value,
        children: children.props.children
      };
      break;
    case Camera:
      childProps = {
        onCapture: onChangeValue,
        value: value
      };
      break;
    case "location":
      childProps = {
        onCapture: onChangeValue,
        value: value
      };
      break;
  }

  const childrenWithProps = React.Children.map(children, child =>
    React.cloneElement(child, {
      ...child.props,
      ...childProps
    })
  );
  const tStyle = textStyle(props.style);
  const style = { ...props.style };
  if (!!style)
    Object.keys(style).map(k => {
      if (Object.keys(tStyle).indexOf(k) > -1) delete style[k];
    });

  useEffect(() => {
    if (!!isValidate) {
      validation(value);
    }
  }, [isValidate]);
  return (
    <View
      style={{
        // zIndex:
        //   ["select", "date"].indexOf(fieldType) > -1 && meta.focus ? 9 : 1,
        marginBottom: 20,
        marginLeft: 0,
        marginRight: 0,
        ..._.get(styles, "root", {}),
        ...style
      }}
      className={Platform.OS === "web" ? "cactiva-field" : undefined}
    >
      {!!labelText && (
        <Text
          style={{
            fontSize: 14,
            color: Theme.UIColors.secondary,
            marginBottom: 5,
            ...((styles && styles.label) || {}),
            ...tStyle
          }}
        >
          {labelText}
        </Text>
      )}
      <View
        style={{
          borderBottomStyle: "solid",
          borderColor: meta.error
            ? Theme.UIColors.danger
            : meta.focus && isFocus
            ? Theme.UIColors.primary
            : "#e4e4e4",
          borderBottomWidth: enableBorder != false || meta.error ? 1 : 0,
          flexDirection: "row",
          alignItems: "stretch",
          paddingRight: 10,
          paddingLeft: 10,
          padding: 4,
          justifyContent: "flex-start",
          display: "flex",
          ..._.get(Theme, "fieldStyle", {}),
          ...((styles && styles.field) || {})
        }}
        className={Platform.OS === "web" ? "cactiva-field-input" : undefined}
      >
        {!!isIconStart && (
          <View
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              ...((styles && styles.iconStart) || {})
            }}
          >
            <Icon
              size={24}
              color={Theme.UIColors.primary}
              style={{ marginRight: 10 }}
              {...iconStart}
            />
          </View>
        )}
        {childrenWithProps}
        {!!isIconEnd && (
          <View
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              ...((styles && styles.iconEnd) || {})
            }}
          >
            <Icon
              size={24}
              color={Theme.UIColors.primary}
              style={{ marginLeft: 10 }}
              {...iconEnd}
            />
          </View>
        )}
      </View>
      {meta.error &&
        meta.errorMessage.length > 0 &&
        meta.errorMessage.map(message => (
          <Text
            key={uuid()}
            style={{
              paddingTop: 5,
              fontSize: 12,
              color: Theme.UIColors.danger
            }}
          >
            *{message}
          </Text>
        ))}
    </View>
  );
});
