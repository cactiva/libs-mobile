import React, { useState } from "react";
import {
  Image,
  ImageProps as OriginImageProps,
  StyleSheet,
  ImageStyle
} from "react-native";
import _ from "lodash";
import Theme from "../../theme";
import Button from "../Button";
import Modal from "../Modal";
import Icon from "../Icon";
import View from "../View";

export interface IImageProps extends OriginImageProps {
  loadingSize?: "small" | "large";
  preview?: boolean;
}

export default (props: IImageProps) => {
  const { style, source, preview } = props;
  const [error, setError] = useState(false);
  const [show, setShow] = useState(false);
  const baseStyle: ImageStyle = {
    margin: 4,
    width: 300,
    height: 150
  };
  const cstyle = StyleSheet.flatten([baseStyle, style]);
  let csource: any = source;
  if (typeof source === "object") {
    csource = {
      ...source,
      cache: "force-cache"
    };
  }

  const btnStyle = {
    padding: 0,
    margin: 0,
    paddingLeft: 0,
    paddingRight: 0,
    backgroundColor: "transparent"
  };

  const onPress = () => {
    setShow(!show);
  };

  return (
    <>
      {!error ? (
        <Button
          activeOpacity={preview ? 0.7 : 1}
          style={btnStyle}
          disabled={!preview}
          onPress={onPress}
        >
          <Image
            resizeMode={"contain"}
            defaultSource={Theme.UIImageLoading}
            {...props}
            source={csource}
            style={cstyle}
            onError={e => {
              const err = _.get(e, "mativeEvent.error", "");
              if (!!err) setError(true);
            }}
          />
        </Button>
      ) : (
        <Image
          resizeMode={"contain"}
          defaultSource={Theme.UIImageLoading}
          {...props}
          source={csource}
          style={cstyle}
        />
      )}
      {!!show && (
        <PreviewImage show={show} setShow={setShow} imgProps={props} />
      )}
    </>
  );
};

const PreviewImage = (props: any) => {
  const { show, setShow, imgProps } = props;
  const onRequestClose = () => {
    setShow(!show);
  };
  return (
    <Modal visible={show} onRequestClose={onRequestClose}>
      <View
        style={{
          backgroundColor: "rgba(0,0,0,0.6)",
          flexShrink: 1,
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Image
          {...imgProps}
          resizeMode={"cover"}
          style={{
            width: "100%",
            height: "100%"
          }}
        />

        <Button
          style={{
            width: 50,
            height: 50,
            position: "absolute",
            top: 10,
            left: 10,
            backgroundColor: "rgba(255,255,255,0.5)",
            borderRadius: 99,
            padding: 0,
            paddingLeft: 0,
            paddingRight: 0
          }}
          onPress={onRequestClose}
        >
          <Icon
            source={"AntDesign"}
            name={"arrowleft"}
            size={30}
            style={{
              margin: 5
            }}
          />
        </Button>
      </View>
    </Modal>
  );
};
