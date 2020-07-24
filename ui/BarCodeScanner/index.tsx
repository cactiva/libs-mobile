import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { BarCodeScanner, BarCodeScannerProps } from "expo-barcode-scanner";
import Button from "../Button";
import Modal from "../Modal";
import Icon, { IIconProps } from "../Icon";
import { Dimensions, ViewStyle, StyleSheet } from "react-native";
import _ from "lodash";
import View from "../View";

export interface IBarCodeScanner extends BarCodeScannerProps {
  children?: any;
  iconProps?: IIconProps;
  styles?: {
    button?: ViewStyle;
    icon?: ViewStyle;
  };
}

export default observer((props: IBarCodeScanner) => {
  const { children } = props;
  const [isShow, setisShow] = useState(false);
  const baseStyle = {
    minWidth: 44,
    minHeight: 44,
    width: 64,
    height: 64,
    paddingHorizontal: 0,
  };
  const buttonStyle = StyleSheet.flatten([
    baseStyle,
    _.get(props, "styles.button"),
  ]);
  return (
    <>
      <Button
        onPress={() => {
          setisShow(true);
        }}
        style={buttonStyle}
      >
        {!!children ? (
          children
        ) : (
          <Icon
            source={"AntDesign"}
            name={"qrcode"}
            size={40}
            color={"white"}
            {..._.get(props, "iconProps", {})}
          />
        )}
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
  const onBarCodeScanned = (props) => {
    if (!!barCodeProps.onBarCodeScanned) barCodeProps.onBarCodeScanned(props);
    else console.log(props);
    setisShow(false);
  };
  const width = 320;
  const borderHorizontal = (dim.width - width) / 2;
  const borderVertical = (dim.height - width) / 2;
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
        barCodeTypes={_.get(barCodeProps, "barCodeTypes", undefined)}
        onBarCodeScanned={!!isShow ? onBarCodeScanned : undefined}
        style={{
          width: dim.width,
          height: dim.height,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "black",
        }}
      >
        <View
          style={{
            minWidth: width,
            minHeight: width,
            borderTopWidth: borderVertical,
            borderBottomWidth: borderVertical,
            borderLeftWidth: borderHorizontal,
            borderRightWidth: borderHorizontal,
            borderColor: "rgba(0,0,0,0.6)",
            borderRadius: 8,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: "center",
            alignItems: "center",
          }}
        ></View>
        <View
          style={{
            minWidth: width - 20,
            minHeight: width - 20,
            margin: 20,
            borderWidth: 2,
            borderColor: "white",
            borderStyle: "dashed",
            borderRadius: 8,
          }}
        ></View>
      </BarCodeScanner>
    </Modal>
  );
});
