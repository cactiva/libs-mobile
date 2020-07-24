import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { BarCodeScanner, BarCodeScannerProps } from "expo-barcode-scanner";
import Button from "../Button";
import Modal from "../Modal";
import Icon from "../Icon";
import { Dimensions } from "react-native";
import _ from "lodash";

export interface IBarCodeScanner extends BarCodeScannerProps {}

export default observer((props: IBarCodeScanner) => {
  const [isShow, setisShow] = useState(false);
  return (
    <>
      <Button
        onPress={() => {
          setisShow(true);
        }}
      >
        <Icon source={"AntDesign"} name={"qrcode"} size={40} color={"white"} />
      </Button>
      <ModalScanner
        isShow={isShow}
        setisShow={setisShow}
        barCodeProps={props}
      />
    </>
  );
});

const ModalScanner = observer((props: any) => {
  const { isShow, setisShow, barCodeProps } = props;
  const dim = Dimensions.get("window");
  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={isShow}
      onRequestClose={() => {
        setisShow(false);
      }}
    >
      <Button
        style={{
          minWidth: 50,
          minHeight: 50,
          width: 50,
          height: 50,
          position: "absolute",
          top: 10,
          left: 10,
          backgroundColor: "rgba(255,255,255,0.5)",
          borderRadius: 99,
          padding: 0,
          paddingLeft: 0,
          paddingRight: 0,
          zIndex: 10,
        }}
        onPress={() => {
          setisShow(false);
        }}
      >
        <Icon
          source={"AntDesign"}
          name={"arrowleft"}
          size={30}
          style={{
            margin: 5,
          }}
        />
      </Button>
      <BarCodeScanner
        type={_.get(barCodeProps, "type", "back")}
        barCodeTypes={_.get(barCodeProps, "barCodeTypes", ["256"])}
        onBarCodeScanned={
          !!isShow
            ? _.get(barCodeProps, "onBarCodeScanned", undefined)
            : undefined
        }
        style={{
          width: dim.width,
          height: dim.height,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "black",
        }}
      >
        <Icon
          name="ios-qr-scanner"
          color="white"
          size={dim.width}
          style={{
            position: "relative",
          }}
        />
      </BarCodeScanner>
    </Modal>
  );
});
