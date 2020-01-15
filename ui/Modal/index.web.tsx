import React from "react";
import { observer } from "mobx-react-lite";
import Modal from "modal-react-native-web";
import { ModalProps } from ".";

export default observer((props: ModalProps) => {
  const { children } = props as any;
  return (
    <Modal
      ariaHideApp={false}
      animationType="slide"
      transparent={true}
      {...props}
    >
      <div className="mobile-root">{children}</div>
    </Modal>
  );
});
