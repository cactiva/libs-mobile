import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect } from "react";
import {
  DatePickerAndroid,
  DatePickerIOS,
  Modal,
  Platform,
  Text,
  TimePickerAndroid,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewStyle
} from "react-native";
import { DefaultTheme, ThemeProps } from "../../theme";
import Icon from "../Icon";
import Input from "../Input";

export interface DateTimeProps {
  onChange?: (value: any) => void;
  maxDate?: Date;
  minDate?: Date;
  theme?: ThemeProps;
  value?: any;
  onFocus?: (e: any) => void;
  onBlur?: () => void;
  showPicker?: boolean;
  style?: ViewStyle;
  dateOnly?: Boolean;
}

export default observer((props: DateTimeProps) => {
  const { value, style, onChange, showPicker, dateOnly } = props;
  const meta = useObservable({
    isShown: false,
    value: new Date(),
    dateString: {
      dd: "",
      mm: "",
      yyyy: "",
      HH: "",
      MM: ""
    }
  });

  const theme = {
    ...DefaultTheme,
    ..._.get(props, "theme", {})
  };
  const onChangeDateString = (v, p) => {
    if (p === "dd") {
      v = v > 31 ? 31 : v < 0 ? 0 : v;
      meta.dateString[p] = v == 0 ? "" : ("0" + v).slice(-2);
    } else if (p === "mm") {
      v = v > 12 ? 12 : v < 0 ? 0 : v;
      meta.dateString[p] = v == 0 ? "" : ("0" + v).slice(-2);
    } else if (p === "HH") {
      v = v > 24 ? 24 : v < 0 ? 0 : v;
      meta.dateString[p] = v == 0 ? "" : ("0" + v).slice(-2);
    } else if (p === "MM") {
      v = v > 59 ? 59 : v < 0 ? 0 : v;
      meta.dateString[p] = v == 0 ? "" : ("0" + v).slice(-2);
    } else meta.dateString[p] = v;
    if (meta.dateString.dd && meta.dateString.mm && meta.dateString.yyyy) {
      let day = new Date(
        parseInt(meta.dateString.yyyy),
        parseInt(meta.dateString.mm),
        0
      ).getDate();
      if (parseInt(meta.dateString.dd) > day) meta.dateString.dd = `${day}`;
      meta.value = new Date(
        parseInt(meta.dateString.yyyy),
        parseInt(meta.dateString.mm) - 1,
        parseInt(meta.dateString.dd),
        parseInt(meta.dateString.HH),
        parseInt(meta.dateString.MM)
      );
      onChange && onChange(meta.value);
    }
  };
  const onChangePicker = date => {
    meta.value = date;
    meta.dateString.dd = ("0" + meta.value.getDate()).slice(-2);
    meta.dateString.mm = ("0" + (meta.value.getMonth() + 1)).slice(-2);
    meta.dateString.yyyy = `${meta.value.getFullYear()}`;
    meta.dateString.HH = ("0" + meta.value.getHours()).slice(-2);
    meta.dateString.MM = ("0" + meta.value.getMinutes()).slice(-2);
    onChange && onChange(date);
  };
  useEffect(() => {
    if (value) {
      let newDate;
      if (typeof value === "string") newDate = new Date(value);
      meta.value = newDate;
      meta.dateString.dd = ("0" + meta.value.getDate()).slice(-2);
      meta.dateString.mm = ("0" + (meta.value.getMonth() + 1)).slice(-2);
      meta.dateString.yyyy = `${meta.value.getFullYear()}`;
      meta.dateString.HH = ("0" + meta.value.getHours()).slice(-2);
      meta.dateString.MM = ("0" + meta.value.getMinutes()).slice(-2);
    }
  }, [value]);
  useEffect(() => {
    if (showPicker !== undefined) meta.isShown = showPicker;
  }, [showPicker]);
  return (
    <>
      <View
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "stretch",
          ...style
        }}
      >
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <Input
            placeholder="dd"
            style={{
              width: 30
            }}
            type="number"
            value={meta.dateString.dd}
            onChangeText={v => onChangeDateString(v, "dd")}
            returnKeyType="next"
          />
          <Text
            style={{
              paddingRight: 10,
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            /
          </Text>
          <Input
            placeholder="mm"
            style={{
              width: 30
            }}
            type="number"
            value={meta.dateString.mm}
            onChangeText={v => onChangeDateString(v, "mm")}
            returnKeyType="next"
          />
          <Text
            style={{
              paddingRight: 10,
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            /
          </Text>
          <Input
            placeholder="yyyy"
            style={{
              width: 50
            }}
            type="number"
            value={meta.dateString.yyyy}
            onChangeText={v => onChangeDateString(v, "yyyy")}
            returnKeyType="next"
          />
          {dateOnly !== true && (
            <>
              <Input
                placeholder="HH"
                style={{
                  width: 30,
                  marginLeft: 5
                }}
                type="number"
                value={meta.dateString.HH}
                onChangeText={v => onChangeDateString(v, "HH")}
                returnKeyType="next"
              />
              <Text
                style={{
                  paddingRight: 10,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center"
                }}
              >
                :
              </Text>
              <Input
                placeholder="MM"
                style={{
                  width: 30
                }}
                type="number"
                value={meta.dateString.MM}
                onChangeText={v => onChangeDateString(v, "MM")}
                returnKeyType="next"
              />
            </>
          )}
        </View>
        {Platform.OS !== "web" && (
          <TouchableOpacity
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              paddingLeft: 5,
              paddingRight: 5
            }}
            onPress={e => {
              e.stopPropagation();
              e.preventDefault();
              meta.isShown = !meta.isShown;
              if (Platform.OS === "ios") {
                onChangePicker(meta.value);
              }
            }}
          >
            <Icon
              source="Ionicons"
              name={"ios-calendar"}
              color={theme.dark}
              size={24}
            />
          </TouchableOpacity>
        )}
      </View>
      <DatePickerModal meta={meta} {...props} onChangePicker={onChangePicker} />
    </>
  );
});

const DatePickerModal = observer((props: any) => {
  const { meta, dateOnly, onChangePicker, minDate, maxDate, onBlur } = props;
  if (Platform.OS === "android") {
    if (meta.isShown) {
      const timePicker = async (year, month, day) => {
        try {
          const { action, hour, minute }: any = await TimePickerAndroid.open({
            hour: meta.value.getHours(),
            minute: meta.value.getMinutes(),
            is24Hour: true // Will display '2 PM'
          });
          if (action !== TimePickerAndroid.dismissedAction) {
            onChangePicker(new Date(year, month, day, hour, minute));
          }
          onBlur && onBlur();
        } catch ({ code, message }) {
          console.warn("Cannot open time picker", message);
          onBlur && onBlur();
        }
      };
      const datePicker = async () => {
        try {
          const {
            action,
            year,
            month,
            day
          }: any = await DatePickerAndroid.open({
            date: meta.value,
            mode: "calendar",
            minDate: minDate && minDate,
            maxDate: maxDate && maxDate
          });
          if (action !== DatePickerAndroid.dismissedAction) {
            if (dateOnly) {
              onChangePicker(new Date(year, month, day, 0, 0));
            } else timePicker(year, month, day);
          }
          onBlur && onBlur();
        } catch ({ code, message }) {
          console.warn("Cannot open date picker", message);
          onBlur && onBlur();
        }
      };
      datePicker();
      meta.isShown = false;
      return null;
    }
  } else if (Platform.OS === "ios") {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={meta.isShown}
        onRequestClose={() => {
          meta.isShown = false;
          onBlur && onBlur();
        }}
      >
        <View
          style={{
            bottom: 0,
            left: 0,
            right: 0,
            position: "absolute",
            height: 200,
            backgroundColor: "#fff",
            zIndex: 9
          }}
        >
          <DatePickerIOS
            date={meta.value}
            onDateChange={onChangePicker}
            mode={"date"}
            minimumDate={minDate && minDate}
            maximumDate={maxDate && maxDate}
          />
          <DatePickerIOS
            date={meta.value}
            onDateChange={onChangePicker}
            mode={"time"}
            minimumDate={minDate && minDate}
            maximumDate={maxDate && maxDate}
          />
        </View>
        <TouchableWithoutFeedback
          onPress={() => {
            meta.isShown = false;
            onBlur && onBlur();
          }}
        >
          <View
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: "rgba(0,0,0,.3)"
            }}
          />
        </TouchableWithoutFeedback>
      </Modal>
    );
  }
  return null;
});
