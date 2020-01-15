import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect } from "react";
import { Text, View } from "react-native";
import { DateTimeProps } from ".";
import { DefaultTheme } from "../../theme";
import { dateToString } from "../../utils";
import Input from "../Input";

export default observer((props: DateTimeProps) => {
  const { value, style, mode, onFocus, onChange, showPicker } = props;
  const meta = useObservable({
    isShown: false,
    value: new Date(),
    dateString: {
      dd: "",
      mm: "",
      yyyy: ""
    },
    scrollH: 0,
    dimensions: null,
    contentHeight: 0
  });
  const theme = {
    ...DefaultTheme,
    ...props.theme
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
  const onDayPress = dateString => {
    meta.value = new Date(dateString);
    meta.dateString.dd = ("0" + meta.value.getDate()).slice(-2);
    meta.dateString.mm = ("0" + (meta.value.getMonth() + 1)).slice(-2);
    meta.dateString.yyyy = `${meta.value.getFullYear()}`;
    onChange && onChange(dateString);
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
    onFocus && onFocus(meta.isShown as any);
  }, [meta.isShown]);

  useEffect(() => {
    meta.isShown = showPicker;
  }, [showPicker]);
  return (
    <>
      <div
        style={{
          position: "initial",
          zIndex: meta.isShown ? 9 : 0,
          minWidth: 147,
          ...(style as any)
        }}
        ref={(ref: any) => {
          if (ref && !meta.dimensions) {
            const dimensions = ref.getBoundingClientRect();
            const parentDimension = ref.parentElement.parentElement.parentElement.getBoundingClientRect();
            meta.dimensions = dimensions;
            meta.scrollH = parentDimension.bottom;
          }
        }}
      >
        <View
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "stretch"
          }}
        >
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start"
            }}
          >
            <Input
              placeholder="dd"
              style={{
                width: 30
              }}
              type="number"
              value={meta.dateString.dd}
              onChange={v => onChangeDateString(v, "dd")}
              onFocus={() => (meta.isShown = false)}
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
              onChange={v => onChangeDateString(v, "mm")}
              onFocus={() => (meta.isShown = false)}
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
                width: 60
              }}
              type="number"
              value={meta.dateString.yyyy}
              onChange={v => onChangeDateString(v, "yyyy")}
              onFocus={() => (meta.isShown = false)}
              returnKeyType="next"
            />
          </View>
        </View>
      </div>
    </>
  );
});
