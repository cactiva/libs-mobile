import Theme from "../../config/theme";
import DateTimePicker from "@react-native-community/datetimepicker";
import set from "lodash.set";
import get from "lodash.get";
import React, { useEffect, useState } from "react";
import { Platform, TextStyle, ViewStyle } from "react-native";
import { dateFormat } from "../../utils/date";
import Button from "../Button";
import Icon, { IIconProps } from "../Icon";
import Modal from "../Modal";
import Text from "../Text";
import View from "../View";

interface IStyles {
  label?: TextStyle;
  icon?: ViewStyle;
}

export interface IDateTimeProps {
  onChange?: (value: any) => void;
  maxDate?: Date;
  minDate?: Date;
  value?: any;
  onFocus?: (e: any) => void;
  onBlur?: () => void;
  showPicker?: boolean;
  style?: ViewStyle;
  iconProps?: IIconProps | any;
  mode?: "date" | "time" | "datetime";
  visibility?: "text-icon" | "text-only" | "icon-only";
  styles?: IStyles;
  editable?: boolean;
}

export default (props: IDateTimeProps) => {
  const {
    style,
    onChange,
    showPicker,
    visibility = "text-icon",
    mode = "date",
    iconProps,
    value,
    editable,
  } = props;
  const [visible, setVisible] = useState(false);

  const onChangePicker = (date: Date) => {
    if (!!onChange) {
      if (mode === "date") {
        onChange(dateFormat(date, "yyyy-MM-dd"));
      } else if (mode === "time") {
        onChange(dateFormat(date, "HH:mm:ss"));
      } else if (mode === "datetime") {
        onChange(date.toISOString());
      }
    }
  };

  const dateString = (val: any) => {
    if (!!val) {
      let date = typeof val === "string" ? new Date(val) : val;
      if (mode === "date") {
        return dateFormat(date, "d MMMM yyyy");
      } else if (mode === "time") {
        return dateFormat(date, "HH:mm");
      } else if (mode === "datetime") {
        return dateFormat(date, "d MMMM yyyy - HH:mm");
      }
    }
    return "";
  };

  const baseStyle: any = {
    margin: 0,
    backgroundColor: "transparent",
    padding: 0,
    paddingHorizontal: 10,
    ...style,
  };

  const labelStyle = {
    color: Theme.UIColors.text,
    fontSize: Theme.UIFontSize,
    flexGrow: 1,
    flexShrink: 1,
    ...get(props, "styles.label"),
  };

  const iconStyle = { margin: 0, ...get(props, "styles.icon") };

  useEffect(() => {
    if (!!showPicker) setVisible(showPicker);
  }, [showPicker]);
  return (
    <>
      <Button
        style={baseStyle}
        onPress={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setVisible(!visible);
        }}
        disabled={editable === false}
      >
        {["text-icon", "text-only"].indexOf(visibility) > -1 && (
          <Text style={labelStyle} numberOfLines={1} ellipsizeMode={"tail"}>
            {dateString(value)}
          </Text>
        )}
        {["text-icon", "icon-only"].indexOf(visibility) > -1 && (
          <Icon
            source="Ionicons"
            name={"ios-calendar"}
            size={24}
            {...iconProps}
            style={iconStyle}
          />
        )}
      </Button>
      <DatePickerModal
        {...props}
        visible={visible}
        setVisible={setVisible}
        value={value}
        mode={mode}
        onChangePicker={onChangePicker}
      />
    </>
  );
};

const DatePickerModal = (props: any) => {
  const {
    onChangePicker,
    minDate,
    maxDate,
    onBlur,
    mode,
    setVisible,
    value,
    visible,
  } = props;
  const currentValue = !!value ? new Date(value) : new Date();
  const [val, setVal] = useState(currentValue);
  const [androidMode, setAndroidMode] = useState(
    mode === "datetime" ? "date" : mode
  );
  const dismiss = () => {
    setVisible(false);
    onBlur && onBlur();
  };
  const onChange = (date: any) => {
    setVisible(false);
    onChangePicker(date);
  };
  const setValue = (ev: any, date: any) => {
    if (Platform.OS === "android") {
      if (ev.type === "dismissed") {
        dismiss();
        if (androidMode === "time")
          setAndroidMode(mode === "datetime" ? "date" : mode);
      } else {
        if (mode !== "datetime") {
          dismiss();
          onChangePicker(date);
          setVal(date);
        } else {
          if (androidMode === "time") {
            dismiss();
            setVal(date);
            setAndroidMode("date");
            onChangePicker(date);
          } else {
            setVal(date);
            setAndroidMode("time");
          }
        }
      }
    } else {
      setVal(date);
    }
  };

  if (Platform.OS === "android") {
    if (!!visible)
      return (
        <DateTimePicker
          value={val}
          mode={androidMode as any}
          is24Hour={true}
          display="default"
          onChange={setValue}
          minimumDate={minDate}
          maximumDate={maxDate}
        />
      );
  } else if (Platform.OS === "ios")
    return (
      <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={() => {
          setVal(currentValue);
          dismiss();
        }}
        screenProps={{
          style: {
            backgroundColor: "rgba(0,0,0,0.3)",
            flexGrow: 1,
          },
        }}
      >
        <Button
          mode={"clean"}
          style={{
            margin: 0,
            borderRadius: 0,
            flexGrow: 1,
          }}
          onPress={dismiss}
        ></Button>
        <View
          style={{
            backgroundColor: "#fff",
          }}
        >
          <DateTimePicker
            value={val}
            mode={mode}
            is24Hour={true}
            display="default"
            onChange={setValue}
            minimumDate={minDate}
            maximumDate={maxDate}
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Button
              mode={"clean"}
              style={{
                minHeight: 35,
                padding: 0,
              }}
              onPress={() => {
                setVal(currentValue);
                dismiss();
              }}
            >
              <Text
                style={{
                  color: Theme.UIColors.primary,
                }}
              >
                Cancel
              </Text>
            </Button>
            <Button
              mode={"clean"}
              style={{
                minHeight: 35,
                padding: 0,
              }}
              onPress={() => {
                onChange(val);
              }}
            >
              <Text
                style={{
                  color: Theme.UIColors.primary,
                }}
              >
                Ok
              </Text>
            </Button>
          </View>
        </View>
      </Modal>
    );
  return null;
};
