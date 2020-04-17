import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect } from "react";
import {
  DatePickerAndroid,
  DatePickerIOS,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ViewStyle,
} from "react-native";
import { DefaultTheme, ThemeProps } from "../../themes";
import { dateToString } from "../../utils";
import Icon from "../Icon";
import Input from "../Input";

export interface DateTimeProps {
  mode?: "date" | "time";
  onChange?: (value: any) => void;
  maxDate?: Date;
  minDate?: Date;
  theme?: ThemeProps;
  value?: any;
  onFocus?: (e: any) => void;
  onBlur?: () => void;
  showPicker?: boolean;
  style?: ViewStyle;
}

export default observer((props: DateTimeProps) => {
  const { value, style, mode, onChange, showPicker } = props;
  const meta = useObservable({
    isShown: false,
    value: new Date(),
    dateString: {
      dd: "",
      mm: "",
      yyyy: "",
    },
  });

  const theme = {
    ...DefaultTheme,
    ..._.get(props, "theme", {}),
  };
  const onChangeDateString = (v, p) => {
    if (p === "dd") {
      v = v > 31 ? 31 : v < 0 ? 0 : v;
      meta.dateString[p] = v == 0 ? "" : ("0" + v).slice(-2);
    } else if (p === "mm") {
      v = v > 12 ? 12 : v < 0 ? 0 : v;
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
        `${meta.dateString.yyyy}-${meta.dateString.mm}-${meta.dateString.dd}`
      );
      onChange && onChange(dateToString(meta.value));
    }
  };
  const onChangePicker = (date) => {
    meta.value = date;
    meta.dateString.dd = ("0" + meta.value.getDate()).slice(-2);
    meta.dateString.mm = ("0" + (meta.value.getMonth() + 1)).slice(-2);
    meta.dateString.yyyy = `${meta.value.getFullYear()}`;
    onChange && onChange(dateToString(date));
  };
  useEffect(() => {
    if (value) {
      let newDate;
      if (typeof value === "string") newDate = new Date(value);
      meta.value = newDate;
      meta.dateString.dd = ("0" + meta.value.getDate()).slice(-2);
      meta.dateString.mm = ("0" + (meta.value.getMonth() + 1)).slice(-2);
      meta.dateString.yyyy = `${meta.value.getFullYear()}`;
    }
  }, []);
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
          ...style,
        }}
      >
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Input
            placeholder="dd"
            style={{
              width: 30,
            }}
            type="number"
            value={meta.dateString.dd}
            onChangeText={(v) => onChangeDateString(v, "dd")}
          />
          <Text
            style={{
              paddingRight: 10,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            /
          </Text>
          <Input
            placeholder="mm"
            style={{
              width: 30,
            }}
            type="number"
            value={meta.dateString.mm}
            onChangeText={(v) => onChangeDateString(v, "mm")}
          />
          <Text
            style={{
              paddingRight: 10,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            /
          </Text>
          <Input
            placeholder="yyyy"
            style={{
              width: 60,
            }}
            type="number"
            value={meta.dateString.yyyy}
            onChangeText={(v) => onChangeDateString(v, "yyyy")}
          />
        </View>
        <TouchableOpacity
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingLeft: 5,
            paddingRight: 5,
          }}
          onPress={(e) => {
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
            name={mode === "time" ? "md-time" : "md-calendar"}
            color={theme.dark}
            size={24}
          />
        </TouchableOpacity>
      </View>
      <DatePickerModal meta={meta} {...props} onChangePicker={onChangePicker} />
    </>
  );
});

const DatePickerModal = observer((props: any) => {
  const { meta, mode, onChangePicker, minDate, maxDate, onBlur } = props;
  if (Platform.OS === "android") {
    if (meta.isShown) {
      const loadPicker = async () => {
        try {
          const {
            action,
            year,
            month,
            day,
          }: any = await DatePickerAndroid.open({
            date: meta.value,
            mode: mode || "calendar",
            minDate: minDate && minDate,
            maxDate: maxDate && maxDate,
          });
          if (action !== DatePickerAndroid.dismissedAction) {
            onChangePicker(new Date(year, month, day));
          }
          onBlur && onBlur();
        } catch ({ code, message }) {
          console.warn("Cannot open date picker", message);
          onBlur && onBlur();
        }
      };
      loadPicker();
      meta.isShown = false;
      return null;
    }
  } else {
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
            zIndex: 9,
          }}
        >
          <DatePickerIOS
            date={meta.value}
            onDateChange={onChangePicker}
            mode={mode || "date"}
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
              backgroundColor: "rgba(0,0,0,.3)",
            }}
          />
        </TouchableWithoutFeedback>
      </Modal>
    );
  }
  return null;
});
