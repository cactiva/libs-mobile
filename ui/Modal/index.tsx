import Constants from "expo-constants";
import { observer } from "mobx-react-lite";
import React from "react";
import { Modal, ModalProps as ModalPropsOrigin, Platform } from "react-native";
import Screen from "../Screen";

export interface ModalProps extends ModalPropsOrigin {
  style?: any;
  children?: any;
}

export default observer((props: ModalProps) => {
  const { style, children } = props;
  const marginTop = Platform.OS === "android" ? -Constants.statusBarHeight : 0;
  return (
    <Modal animationType="fade" transparent={true} {...props}>
      <Screen
        statusbarStyle={{
          marginTop
        }}
        style={style}
      >
        {children}
      </Screen>
    </Modal>
  );
});
