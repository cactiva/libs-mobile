import React from "react";
import { Text } from "react-native";
import { DefaultTheme } from "../../themes";

export default () => {
  return (
    <Text style={{ padding: 10, color: DefaultTheme.danger }}>
      Web not support Location
    </Text>
  );
};

export const getLocation = () => {
  return new Promise(reject => {
    reject("Web not support Location");
  });
};
