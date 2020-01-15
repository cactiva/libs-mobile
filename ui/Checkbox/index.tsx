import { observer } from "mobx-react-lite";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { DefaultTheme, ThemeProps } from "../../theme";
import Icon from "../Icon";

export interface CheckboxProps {
  text?: string;
  value?: string;
  checked?: boolean;
  onPress?: (value: boolean) => void;
  style?: any;
  theme?: ThemeProps;
}

export default observer((props: CheckboxProps) => {
  const { text, onPress, value, style } = props;
  const checked = props.checked === true || !!value ? true : false;
  const theme = {
    ...DefaultTheme,
    ...props.theme
  };
  return (
    <TouchableOpacity
      style={{
        marginTop: 5,
        marginBottom: 5
      }}
      onPress={() => {
        onPress && onPress(!checked);
      }}
    >
      <View
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          ...style
        }}
      >
        <View
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: checked ? theme.primary : theme.light,
            borderWidth: 1,
            borderStyle: "solid",
            borderColor: checked ? theme.primary : theme.medium,
            width: 20,
            height: 20,
            borderRadius: 4,
            marginRight: 8
          }}
        >
          <Icon
            source="Entypo"
            name="check"
            size={16}
            color={checked ? "white" : theme.light}
            style={{
              padding: 0
            }}
          />
        </View>
        <Text
          style={{
            color: theme.dark
          }}
        >
          {text}
        </Text>
      </View>
    </TouchableOpacity>
  );
});
