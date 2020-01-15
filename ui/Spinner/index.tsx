import Theme from "@src/theme.json";
import { observer } from "mobx-react-lite";
import React from "react";
import { ActivityIndicator, ActivityIndicatorProps } from "react-native";
import { DefaultTheme } from "../../theme";

export default observer((props: ActivityIndicatorProps) => {
  const theme = {
    ...DefaultTheme,
    ...Theme.colors
  };
  return <ActivityIndicator color={theme.primary} {...props} />;
});
