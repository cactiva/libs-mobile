import Theme from "@src/theme.json";
import _ from "lodash";
import React from "react";
import { DefaultTheme } from "@src/libs/theme";
import { Text } from "..";
const theme = {
  ...DefaultTheme,
  ...Theme.colors
};

export default (props: any) => {
  return <Text>Web not support.</Text>;
};
