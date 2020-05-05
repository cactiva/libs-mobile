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

export interface ModalProps extends ModalPropsOrigin {
  style?: any;
  children?: any;
  screenProps?: IScreenProps;
  styles?: {
    screen?: ViewStyle;
    statusbar?: ViewStyle;
  };
}

export default observer((props: ModalProps) => {
  const { style, children, screenProps } = props;
  const marginTop = Platform.OS === "android" ? -Constants.statusBarHeight : 0;
  const baseStyle = {};
  const cstyle = StyleSheet.flatten([
    baseStyle,
    style,
    _.get(props, "styles.screen", {}),
    _.get(props, "screenProps.style", {}),
  ]);
  const statusbarStyle = StyleSheet.flatten([
    {
      marginTop,
    },
    _.get(props, "styles.statusbar", {}),
    _.get(props, "screenProps.styles.statusbar"),
  ]);
  return (
    <Modal animationType="fade" transparent={true} {...props}>
      <Screen
        {...screenProps}
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
