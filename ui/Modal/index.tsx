import set from "lodash.set";
import get from "lodash.get";
import { observer } from "mobx-react-lite";
import React from "react";
import {
  Modal,
  ModalProps as ModalPropsOrigin,
  StyleSheet,
  ViewStyle,
} from "react-native";
import Screen, { IScreenProps } from "../Screen";

export interface ModalProps extends ModalPropsOrigin {
  style?: ViewStyle;
  children?: any;
  screenProps?: IScreenProps;
}

export default observer((props: ModalProps) => {
  const { style, children, screenProps } = props;
  const baseStyle = {
    backgroundColor: "transparent",
  };
  const cstyle = StyleSheet.flatten([
    baseStyle,
    style,
    get(props, "screenProps.style", {}),
  ]);
  return (
    <Modal animationType="fade" transparent={true} {...props}>
      <Screen {...screenProps} style={cstyle}>
        {children}
      </Screen>
    </Modal>
  );
});
