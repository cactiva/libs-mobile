import { observer } from "mobx-react-lite";
import React from "react";
import { View as ViewNative, ViewStyle } from "react-native";
import { View } from '../index';

export interface IColumnProps {
  title?: string;
  width?: number;
  path?: string;
  style?: ViewStyle;
  onPress?: ((item, path) => void) | false;
  children?: any;
}
export default observer((props: IColumnProps) => {
  return <ViewNative {...props}></ViewNative>;
});
