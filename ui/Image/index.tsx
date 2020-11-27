import set from "lodash.set";
import get from "lodash.get";
import { action, toJS } from "mobx";
import { observer, useLocalObservable } from "mobx-react-lite";
import React, { useEffect } from "react";
import {
  Dimensions,
  ImageStyle,
  StyleSheet,
  TextStyle,
  ViewStyle,
} from "react-native";
import FastImage, { FastImageProps } from "react-native-fast-image";
import Theme from "../../config/theme";
import Button from "../Button";
import Icon from "../Icon";
import Modal from "../Modal";
import Spinner from "../Spinner";
import Text from "../Text";
import View from "../View";

interface IStyle {
  preview?: ViewStyle;
  thumbnail?: ViewStyle;
  caption?: TextStyle;
}

export interface IImageProps extends FastImageProps {
  preview?: boolean;
  styles?: IStyle;
  disableLoading?: boolean;
  caption?: string;
  enableProgress?: boolean;
}

export default observer((props: IImageProps) => {
  const { source, style }: any = props;
  const meta = useLocalObservable(() => ({
    show: false,
    imageUri: Theme.UIImageLoading,
    progress: 0,
  }));
  const baseStyle: ImageStyle = {
    width: 300,
    height: 150,
  };
  const cstyle = StyleSheet.flatten([baseStyle, style]);

  useEffect(
    action(() => {
      if (
        typeof source === "number" ||
        (typeof source == "object" && source.uri.indexOf("file://") > -1)
      ) {
        meta.imageUri = source;
      } else {
        meta.imageUri = {
          priority: FastImage.priority.normal,
          ...source,
        };
      }
    }),
    [source]
  );

  return (
    <>
      <Thumbnail {...props} meta={meta} cstyle={cstyle} />
      <PreviewImage {...props} meta={meta} cstyle={cstyle} />
    </>
  );
});

const Thumbnail = observer((props: any) => {
  const { preview, meta, cstyle, disableLoading }: any = props;
  const btnBaseStyle: ViewStyle = {
    padding: 0,
    margin: 0,
    paddingHorizontal: 0,
    backgroundColor: "transparent",
    opacity: !preview ? 1 : undefined,
    width: get(cstyle, "width", undefined),
    height: get(cstyle, "height", undefined),
    justifyContent: "center",
    alignItems: "center",
    // flex: 1,
  };
  const btnStyle = StyleSheet.flatten([
    btnBaseStyle,
    get(props, "styles.thumbnail", {}),
  ]);
  const onPress = action(() => {
    meta.show = true;
  });
  const resizeMode = get(props, "resizeMode", "contain");
  const style = cstyle;

  return (
    <>
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
        <FastImage
          defaultSource={
            disableLoading === true ? undefined : Theme.UIImageLoading
          }
          {...props}
          resizeMode={resizeMode}
          source={toJS(meta.imageUri)}
          style={style}
        />
        <LoadingProgress {...props} mode={"thumbnail"} />
        {!!props.caption && (
          <Text
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: 15,
              paddingVertical: 10,
              color: "white",
              backgroundColor: "rgba(0,0,0,0.5)",
              textAlign: "center",
              flex: 1,
              flexWrap: "wrap",
              overflow: "hidden",
            }}
            ellipsizeMode={"tail"}
            numberOfLines={2}
          >
            {props.caption}
          </Text>
        )}
      </Button>
    </>
  );
});

const LoadingProgress = observer((props: any) => {
  const { meta, mode, enableProgress } = props;
  if (!!enableProgress && mode === "thumbnail") {
    return (
      <View
        style={{
          backgroundColor: "white",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          padding: 5,
          position: "absolute",
          top: 5,
          right: 5,
          borderRadius: 4,
          paddingHorizontal: 8,
        }}
      >
        {/* <Spinner /> */}
        <Text
          style={{
            fontSize: 10,
            marginLeft: 5,
            marginTop: 2,
          }}
        >
          ({meta.progress}%)
        </Text>
      </View>
    );
  }
  if (!!enableProgress && mode === "preview") {
    return (
      <View
        style={{
          backgroundColor: "white",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          padding: 5,
          position: "absolute",
          borderRadius: 4,
          paddingHorizontal: 8,
        }}
      >
        <Spinner />
        <Text
          style={{
            fontSize: 10,
            marginLeft: 5,
            marginTop: 2,
          }}
        >
          Downloading... ({meta.progress}%)
        </Text>
      </View>
    );
  }
  return null;
});

const PreviewImage = observer((props: any) => {
  const { meta, cstyle } = props;
  const dim = Dimensions.get("window");
  const onRequestClose = action(() => {
    meta.show = false;
  });
  const resizeMode = "contain";
  const previewStyle = StyleSheet.flatten([
    cstyle,
    {
      width: dim.width,
      height: dim.height,
    },
  ]);
  const style = previewStyle;

  return (
    <Modal visible={meta.show} onRequestClose={onRequestClose}>
      <View
        style={{
          backgroundColor: "rgba(0,0,0,0.8)",
          flexShrink: 1,
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <LoadingProgress {...props} mode={"preview"} />
        <FastImage
          {...props}
          resizeMode={resizeMode}
          source={toJS(meta.imageUri)}
          style={style}
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
            right: 10,
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
            name={"md-close"}
            color={Theme.UIColors.primary}
            size={24}
            style={{
              margin: 0,
            }}
          />
        </Button>
        {!!props.caption && (
          <Text
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: 15,
              color: "white",
              backgroundColor: "rgba(0,0,0,0.5)",
              textAlign: "center",
              flex: 1,
            }}
          >
            {props.caption}
          </Text>
        )}
      </View>
    </Modal>
  );
});
