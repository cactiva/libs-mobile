import { observer } from "mobx-react-lite";
import React from "react";
import { View, ViewStyle } from "react-native";
import TableColumn from "./TableColumn";

export interface IHeadProps {
  style?: ViewStyle;
  children: any;
}
export default observer((props: IHeadProps) => {
  return (
    <View {...props}>
      {props.children ? props.children : <TableColumn></TableColumn>}
    </View>
  );
});
