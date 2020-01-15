import React from "react";
import { observer } from "mobx-react-lite";
import { Modal, ModalProps as ModalPropsOrigin } from "react-native";

export interface ModalProps extends ModalPropsOrigin {}

export default observer((props: ModalProps) => {
  return <Modal animationType="slide" transparent={true} {...props} />;
});
