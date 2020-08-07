import store from "@src/libs/store";
import Constants from "expo-constants";
import * as FileSystem from "expo-file-system";
import _ from "lodash";
import { observer, useObservable } from "mobx-react-lite";
import Path from "path";
import React, { useEffect, useState } from "react";
import {
  Image,
  ImageProps as OriginImageProps,
  ImageStyle,
  StyleSheet,
  TextStyle,
  ViewStyle,
} from "react-native";
import Theme from "../../theme";
import Button from "../Button";
import Icon from "../Icon";
import Modal from "../Modal";
import Text from "../Text";
import View from "../View";
import libsStorage from "../store";
import { toJS } from "mobx";

interface IStyle {
  preview?: ViewStyle;
  caption?: TextStyle;
}

const callback = (downloadProgress, uri) => {
  const progress =
    downloadProgress.totalBytesWritten /
    downloadProgress.totalBytesExpectedToWrite;
  let img = toJS(libsStorage.images[uri]);
  img = {
    ...img,
    progress,
  };
  libsStorage.images[uri] = img;
};

const downloadImage = async (uri, pathFile, resumeData = null) => {
  const downloadResumable = FileSystem.createDownloadResumable(
    uri,
    pathFile,
    {},
    (data) => {
      callback(data, uri);
    },
    resumeData
  );
  let res;
  try {
    if (!resumeData) {
      res = await downloadResumable.downloadAsync();
    } else {
      res = await downloadResumable.resumeAsync();
    }
    let progress = _.get(libsStorage.images[uri], "progress", 0);
    if (progress < 1) {
      downloadImage(uri, pathFile, downloadResumable.savable());
    } else {
      let img = toJS(libsStorage.images[uri]);
      img = {
        ...img,
        error: false,
        loading: false,
        uri: res.uri,
      };
      libsStorage.images[uri] = img;
    }
  } catch (error) {
    console.log(error);
    let img = toJS(libsStorage.images[uri]);
    img = {
      ...img,
      error: true,
      loading: false,
    };
    libsStorage.images[uri] = img;
  }
};

const getImage = async ({ uri, cache }) => {
  try {
    if (uri.indexOf("file://") > -1) {
      libsStorage.images[uri] = {
        error: false,
        loading: false,
        uri,
      };
      return;
    }
    const fileName = Path.basename(uri);
    const ext = Path.extname(uri);
    const pathDir = FileSystem.cacheDirectory + Constants.manifest.slug + "/";
    const pathFile = pathDir + fileName;
    if (!ext) {
      libsStorage.images[uri] = {
        error: true,
        loading: false,
      };
      return;
    }
    const dirs = await FileSystem.readDirectoryAsync(pathDir).catch((error) =>
      console.log(error)
    );
    if (!dirs) {
      await FileSystem.makeDirectoryAsync(pathDir).catch((error) =>
        console.log(error)
      );
    }
    const { exists }: any = await FileSystem.getInfoAsync(pathFile).catch(
      (error) => {
        console.log(error);
      }
    );
    if (!!exists && cache != "reload") {
      libsStorage.images[uri] = {
        error: false,
        loading: false,
        uri: pathFile,
      };
      return;
    } else {
      libsStorage.images[uri] = {
        error: false,
        loading: true,
      };
      await downloadImage(uri, pathFile);
      return;
    }
  } catch (error) {
    console.log(error);
    libsStorage.images[uri] = {
      error: true,
      loading: false,
    };
  }
};

export interface IImageProps extends OriginImageProps {
  loadingSize?: "small" | "large";
  preview?: boolean;
  styles?: IStyle;
  disableLoading?: boolean;
  caption?: string;
}

export default observer((props: IImageProps) => {
  const { source, disableLoading }: any = props;
  const meta = useObservable({
    error: false,
    show: false,
    loading: disableLoading === true ? false : true,
    imageUri: Theme.UIImageLoading,
  });

  useEffect(() => {
    if (typeof source === "object") {
      getImage(source);
    }
  }, [source]);

  useEffect(() => {
    if (!!libsStorage.images[source.uri]) {
      let { error, loading, uri } = libsStorage.images[source.uri];
      if (!loading) {
        meta.error = error;
        meta.loading = loading;
        if (!!uri) {
          meta.imageUri = { uri };
        }
        delete libsStorage.images[source.uri];
      }
    }
  }, [libsStorage.images[source.uri]]);
  return (
    <>
      <Thumbnail {...props} meta={meta} />
      <PreviewImage imgProps={props} meta={meta} />
    </>
  );
});

const Thumbnail = observer((props: any) => {
  const { source, style, preview, meta }: any = props;
  const baseStyle: ImageStyle = {
    width: 300,
    height: 150,
  };
  const cstyle = StyleSheet.flatten([baseStyle, style]);
  let width = 240;
  if (!!cstyle.width) {
    if (typeof cstyle.width === "string") {
      let w: string = cstyle.width;
      w = w.replace("%", "");
      width = parseInt(w) * 0.7;
    } else {
      width = cstyle.width * 0.7;
    }
  }
  const loadingStyle: ImageStyle = StyleSheet.flatten([
    cstyle,
    {
      alignSelf: "center",
      width,
    },
  ]);

  const btnStyle: ViewStyle = {
    padding: 0,
    margin: 0,
    paddingLeft: 0,
    paddingRight: 0,
    backgroundColor: "transparent",
    opacity: !preview ? 1 : undefined,
    width: _.get(cstyle, "width", undefined),
    height: _.get(cstyle, "height", undefined),
  };

  const onPress = () => {
    meta.show = true;
  };

  if (!meta.error) {
    return (
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
        <Image
          defaultSource={Theme.UIImageLoading}
          {...props}
          resizeMode={
            !!meta.loading ? "contain" : _.get(props, "resizeMode", "contain")
          }
          source={typeof source === "object" ? meta.imageUri : source}
          style={!!meta.loading ? loadingStyle : cstyle}
        />
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
    );
  }
  return (
    <View style={btnStyle}>
      <Image
        defaultSource={Theme.UIImageLoading}
        {...props}
        resizeMode={"contain"}
        source={Theme.UIImageError}
        style={loadingStyle}
      />
    </View>
  );
});

const PreviewImage = observer((props: any) => {
  const { meta, imgProps } = props;
  const onRequestClose = () => {
    meta.show = false;
  };
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
        {!!imgProps.caption && (
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
            {imgProps.caption}
          </Text>
        )}
      </View>
    </Modal>
  );
});
