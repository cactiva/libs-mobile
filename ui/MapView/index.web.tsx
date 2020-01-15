import { observer } from "mobx-react-lite";
import React from "react";
import { Text } from "react-native";
import { MapViewProps } from "./index";

export default observer((props: MapViewProps) => {
  return <Text>Maps not support web.</Text>;
});

export const Marker = () => {
  return <Text>Maps not support web.</Text>;
};
