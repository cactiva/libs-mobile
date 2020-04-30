import Constants from "expo-constants";
import { observer } from "mobx-react-lite";
import React from "react";
import {
  Modal,
  ModalProps as ModalPropsOrigin,
  Platform,
  StyleSheet,
} from "react-native";
import Screen, { IScreenProps } from "../Screen";
import _ from "lodash";

export interface ModalProps extends ModalPropsOrigin {
  style?: any;
  children?: any;
  screenProps?: IScreenProps;
}

export default observer((props: ModalProps) => {
  const { style, children } = props;
  const marginTop = Platform.OS === "android" ? -Constants.statusBarHeight : 0;
  const baseStyle = {
    backgroundColor: "transparent",
  };
  const cstyle = StyleSheet.flatten([
    baseStyle,
    style,
    _.get(props, "screenProps.style", {}),
  ]);
  const statusbarStyle = StyleSheet.flatten([
    {
      marginTop,
    },
    _.get(props, "screenProps.styles.statusbar"),
  ]);
  return (
    <Modal animationType="fade" transparent={true} {...props}>
      <Screen
        style={cstyle}
        styles={{
          statusbar: statusbarStyle,
        }}
      >
        {children}
      </Screen>
    </Modal>
  );
});
