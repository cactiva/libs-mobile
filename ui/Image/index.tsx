import React, { useState } from "react";
import {
  Image,
  ImageProps as OriginImageProps,
  StyleSheet,
  ImageStyle,
  ViewStyle,
} from "react-native";
import _ from "lodash";
import Theme from "../../theme";
import Button from "../Button";
import Modal from "../Modal";
import Icon from "../Icon";
import View from "../View";

interface IStyle {
  preview?: ViewStyle;
}

export interface IImageProps extends OriginImageProps {
  loadingSize?: "small" | "large";
  preview?: boolean;
  styles?: IStyle;
}

export default (props: IImageProps) => {
  const { style, source, preview } = props;
  const [error, setError] = useState(false);
  const [show, setShow] = useState(false);
  const baseStyle: ImageStyle = {
    width: 300,
    height: 150,
  };
  const cstyle = StyleSheet.flatten([baseStyle, style]);
  const loadingStyle = StyleSheet.flatten([
    cstyle,
    {
      backgroundColor: Theme.UIColors.primary,
    },
  ]);
  let csource: any = source;
  if (typeof source === "object") {
    csource = {
      ...source,
      cache: "force-cache",
    };
  }

  const btnStyle: ViewStyle = {
    padding: 0,
    margin: 0,
    paddingLeft: 0,
    paddingRight: 0,
    backgroundColor: "transparent",
    opacity: !preview ? 1 : undefined,
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
          styles={{
            disabled: {
              opacity: 1,
            },
          }}
        >
          {!error && (
            <Image
              resizeMode={"contain"}
              defaultSource={Theme.UIImageLoading}
              {...props}
              source={csource}
              style={cstyle}
              onError={(e) => {
                const err = _.get(e, "mativeEvent.error", "");
                if (!!err) setError(true);
              }}
            />
          )}
        </Button>
      ) : (
        <Image
          resizeMode={"contain"}
          defaultSource={Theme.UIImageLoading}
          {...props}
          source={csource}
          style={loadingStyle}
        />
      )}
      <PreviewImage show={show} setShow={setShow} imgProps={props} />
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
          backgroundColor: "rgba(0,0,0,0.8)",
          flexShrink: 1,
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          {...imgProps}
          resizeMode={"contain"}
          style={{
            width: "100%",
            height: "100%",
          }}
        />

        <Button
          shadow
          activeOpacity={0.8}
          style={{
            minWidth: 44,
            minHeight: 44,
            width: 44,
            height: 44,
            position: "absolute",
            top: 10,
            left: 10,
            backgroundColor: "#fff",
            borderRadius: 99,
            padding: 0,
            paddingHorizontal: 0,
            justifyContent: "center",
            alignItems: "center",
          }}
          onPress={onRequestClose}
        >
          <Icon
            source={"AntDesign"}
            name={"arrowleft"}
            color={Theme.UIColors.primary}
            size={24}
            style={{
              margin: 0,
              height: 24,
            }}
          />
        </Button>
      </View>
    </Modal>
  );
};
