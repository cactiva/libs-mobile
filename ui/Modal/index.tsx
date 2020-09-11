import Constants from "expo-constants";
import { observer } from "mobx-react-lite";
import React from "react";
import {
  Modal,
  ModalProps as ModalPropsOrigin,
  Platform,
  StyleSheet,
  ViewStyle,
} from "react-native";
import Screen, { IScreenProps } from "../Screen";
import _ from "lodash";
import Theme from "@src/libs/theme";

export interface ModalProps extends ModalPropsOrigin {
  style?: ViewStyle;
  children?: any;
  screenProps?: IScreenProps;
  styles?: {
    screen?: ViewStyle;
    statusbar?: ViewStyle;
  };
}

export default observer((props: ModalProps) => {
  const { style, children, screenProps } = props;
  const baseStyle = {
    backgroundColor: "transparent",
  };
  const cstyle = StyleSheet.flatten([
    baseStyle,
    style,
    _.get(props, "styles.screen", {}),
    _.get(props, "screenProps.style", {}),
  ]);
  return (
    <Modal animationType="fade" transparent={true} {...props}>
      <Screen {...screenProps} style={cstyle}>
        {children}
      </Screen>
    </Modal>
  );
});
