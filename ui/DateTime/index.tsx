import DateTimePicker from "@react-native-community/datetimepicker";
import { toJS } from "mobx";
import React, { useEffect, useState } from "react";
import { Platform, ViewStyle, TextStyle } from "react-native";
import Theme from "../../theme";
import { dateFormat } from "../../utils/date";
import Button from "../Button";
import Icon, { IIconProps } from "../Icon";
import Text from "../Text";
import Modal from "../Modal";
import View from "../View";
import { TouchableOpacity } from "react-native-gesture-handler";
import _ from "lodash";
import Container from "../Container";

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
}

export default (props: IDateTimeProps) => {
  const {
    style,
    onChange,
    showPicker,
    visibility = "text-icon",
    mode = "date",
    iconProps,
  } = props;
  const [visible, setVisible] = useState(false);
  const [value, setValue] = useState(new Date(props.value || new Date()));

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
    setValue(date);
  };

  const dateString = () => {
    let date = toJS(value);
    if (mode === "date") {
      return dateFormat(date, "d MMMM yyyy");
    } else if (mode === "time") {
      return dateFormat(date, "HH:mm");
    } else if (mode === "datetime") {
      return dateFormat(date, "d MMMM yyyy - HH:mm");
    }
    return "";
  };

  useEffect(() => {
    if (!!showPicker) setVisible(showPicker);
  }, [showPicker]);

  useEffect(() => {
    if (!props.value) {
      onChangePicker(value);
    }
  }, []);

  const baseStyle: any = {
    backgroundColor: "transparent",
    padding: 0,
    paddingHorizontal: 10,
    ...Theme.UIInput,
    ...style,
  };

  const labelStyle = {
    color: Theme.UIColors.text,
    fontSize: Theme.UIFontSize,
    flexGrow: 1,
    flexShrink: 1,
    ..._.get(props, "styles.label"),
  };

  const iconStyle = { margin: 0, ..._.get(props, "styles.icon") };

  return (
    <>
      <Button
        style={baseStyle}
        onPress={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setVisible(!visible);
        }}
      >
        {["text-icon", "text-only"].indexOf(visibility) > -1 && (
          <Text style={labelStyle} numberOfLines={1} ellipsizeMode={"tail"}>
            {dateString()}
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
  const [val, setVal] = useState(new Date());
  const [androidMode, setAndroidMode] = useState("date");
  const dismiss = () => {
    setVisible(false);
    onBlur && onBlur();
  };
  const onChange = (date) => {
    setVisible(false);
    onChangePicker(date);
  };
  const setValue = (ev, date) => {
    if (Platform.OS === "android") {
      if (ev.type === "dismissed") {
        if (androidMode === "time") setAndroidMode("date");
        setVal(value);
        dismiss();
      } else {
        if (mode !== "datetime") {
          dismiss();
          onChangePicker(date);
          setVal(date);
        } else {
          if (androidMode === "time") {
            dismiss();
            onChangePicker(date);
            setVal(date);
            setAndroidMode("date");
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

  useEffect(() => {
    setVal(value);
    if (mode === "time") setAndroidMode(mode);
  }, []);

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
          setVal(value);
          dismiss();
        }}
        screenProps={{
          style: {
            backgroundColor: "rgba(0,0,0,0.3)",
            flexGrow: 1,
          },
          styles: {
            statusbar: {
              backgroundColor: "rgba(0,0,0,0.3)",
            },
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
                setVal(value);
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
