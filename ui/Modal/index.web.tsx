import React from "react";
import { observer } from "mobx-react-lite";
import Modal from "modal-react-native-web";
import { ModalProps } from ".";

export default observer((props: ModalProps) => {
  return (
    <Modal
      ariaHideApp={false}
      animationType="slide"
      transparent={true}
      {...props}
    />
  );
});
