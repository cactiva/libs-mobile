import React from "react";
import { observer } from "mobx-react-lite";
import {
  Modal,
  ModalProps as ModalPropsOrigin,
  StyleSheet,
  Platform
} from "react-native";
import Constants from "expo-constants";
import Screen from "../Screen";
import Container from "../Container";

export interface ModalProps extends ModalPropsOrigin {
  style?: any;
  children?: any;
}

export default observer((props: ModalProps) => {
  const { style, children } = props;
  const marginTop = Platform.OS === "android" ? -Constants.statusBarHeight : 0;
  return (
    <Modal animationType="slide" transparent={true} {...props}>
      <Screen
        statusbarStyle={{
          marginTop
        }}
      >
        <Container style={style}>{children}</Container>
      </Screen>
    </Modal>
  );
});
