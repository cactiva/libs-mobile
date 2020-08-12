import Constants from "expo-constants";
import * as FileSystem from "expo-file-system";
import _ from "lodash";
import { toJS } from "mobx";
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
  AsyncStorage,
  Dimensions,
} from "react-native";
import Theme from "../../theme";
import Button from "../Button";
import Icon from "../Icon";
import Modal from "../Modal";
import libsStorage from "../store";
import Text from "../Text";
import View from "../View";
import Spinner from "../Spinner";

interface IStyle {
  preview?: ViewStyle;
  caption?: TextStyle;
}

const callback = (downloadProgress, uri) => {
  let cacheImages = toJS(libsStorage.cacheImages);
  let cacheIdx = cacheImages.findIndex((x) => x.uri === uri);
  const progress =
    downloadProgress.totalBytesWritten /
    downloadProgress.totalBytesExpectedToWrite;
  cacheImages[cacheIdx] = {
    ...cacheImages[cacheIdx],
    progress,
  };
  libsStorage.cacheImages = cacheImages;
};

const downloadImage = async (uri, pathFile, resumeData = null) => {
  let cacheImages = toJS(libsStorage.cacheImages);
  let cacheIdx = cacheImages.findIndex((x) => x.uri === uri);
  let downloadResumable;
  if (!!resumeData) {
    downloadResumable = new FileSystem.DownloadResumable(
      uri,
      pathFile,
      {},
      (data) => {
        callback(data, uri);
      },
      resumeData
    );
  } else {
    downloadResumable = FileSystem.createDownloadResumable(
      uri,
      pathFile,
      {},
      (data) => {
        callback(data, uri);
      },
      resumeData
    );
  }
  try {
    let res;
    if (!resumeData) {
      res = await downloadResumable.downloadAsync();
    } else {
      res = await downloadResumable.resumeAsync();
    }
    if (res.status == 200) {
      cacheImages[cacheIdx] = {
        ...cacheImages[cacheIdx],
        error: false,
        loading: false,
        path: res.uri,
      };
      libsStorage.cacheImages = cacheImages;
    } else if (res.status != 200) {
      cacheImages[cacheIdx] = {
        ...cacheImages[cacheIdx],
        error: true,
        resumeData: downloadResumable.savable(),
      };
      libsStorage.cacheImages = cacheImages;
    }
  } catch (error) {
    let img = toJS(libsStorage.images[uri]);
    img = {
      ...img,
      error: true,
      loading: false,
    };
    libsStorage.images[uri] = img;
    console.log(error);
  }
};

const getImage = async ({ uri, cache }) => {
  let cacheImages = toJS(libsStorage.cacheImages);
  let cacheIdx = cacheImages.findIndex((x) => x.uri === uri);
  try {
    const fileName = Path.basename(uri);
    const ext = Path.extname(uri);
    const pathDir = FileSystem.cacheDirectory + Constants.manifest.slug + "/";
    const pathFile = pathDir + fileName;

    if (!ext) {
      cacheImages[cacheIdx] = {
        ...cacheImages[cacheIdx],
        error: true,
        loading: false,
      };
      libsStorage.cacheImages = cacheImages;
      return;
    }
    if (!libsStorage.cacheExist) {
      const dirs = await FileSystem.readDirectoryAsync(pathDir).catch((error) =>
        console.log(error)
      );
      if (!dirs && !Array.isArray(dirs)) {
        await FileSystem.makeDirectoryAsync(pathDir).catch((error) =>
          console.log(error)
        );
      }
      libsStorage.cacheExist = true;
    }
    const { exists }: any = await FileSystem.getInfoAsync(pathFile).catch(
      (error) => {
        console.log(error);
      }
    );
    if (!!exists && cache != "reload") {
      cacheImages[cacheIdx] = {
        ...cacheImages[cacheIdx],
        loading: false,
        path: pathFile,
      };
      libsStorage.cacheImages = cacheImages;
      return;
    } else {
      if (!!cacheImages[cacheIdx].error) {
        cacheImages[cacheIdx].trying += 1;
        libsStorage.cacheImages = cacheImages;
        if (cacheImages[cacheIdx].trying > 3) {
          cacheImages[cacheIdx] = {
            ...cacheImages[cacheIdx],
            error: true,
            loading: false,
          };
          libsStorage.cacheImages = cacheImages;
          return;
        } else if (
          cacheImages[cacheIdx].progress > 0 &&
          cacheImages[cacheIdx].progress < 1
        ) {
          await downloadImage(uri, pathFile, cacheImages[cacheIdx].resumeData);
          return;
        }
      }
      libsStorage.cacheImages = cacheImages;
      await downloadImage(uri, pathFile);
      return;
    }
  } catch (error) {
    cacheImages[cacheIdx] = {
      ...cacheImages[cacheIdx],
      error: true,
    };
    libsStorage.cacheImages = cacheImages;
    console.log(error);
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
  const { source, disableLoading, style }: any = props;
  const meta = useObservable({
    error: false,
    show: false,
    loading: disableLoading === true ? false : true,
    imageUri: null,
  });
  const dim = Dimensions.get("window");
  const baseStyle: ImageStyle = {
    width: 300,
    height: 150,
  };
  const cstyle = StyleSheet.flatten([baseStyle, style]);
  let width: any = 240;
  if (!!cstyle.width) {
    if (typeof cstyle.width === "string") {
      let w: string = cstyle.width;
      w = w.replace("%", "");
      width = String((dim.width / parseInt(w)) * 0.7) + "%";
    } else {
      width = cstyle.width * 0.7;
    }
  }
  const loadingStyle: ImageStyle = StyleSheet.flatten([
    cstyle,
    {
      width,
    },
  ]);

  useEffect(() => {
    // libsStorage.cacheImages = [];
    // console.log(toJS(libsStorage.cacheImages));
    if (typeof source === "object" && source.uri.indexOf("http") > -1) {
      let cacheImages = toJS(libsStorage.cacheImages);
      let cacheIdx = cacheImages.findIndex((x) => x.uri === source.uri);
      if (cacheIdx < 0 || (cacheIdx > -1 && cacheImages[cacheIdx].trying > 3)) {
        cacheImages.push({
          uri: source.uri,
          error: false,
          loading: true,
          trying: 1,
        });
        libsStorage.cacheImages = cacheImages;
        getImage(source);
      }
    } else if (
      typeof source === "number" ||
      source.uri.indexOf("file://") > -1
    ) {
      meta.loading = false;
      meta.imageUri = source;
    }
  }, [source]);

  useEffect(() => {
    let cacheImages = toJS(libsStorage.cacheImages);
    let cacheIdx = cacheImages.findIndex((x) => x.uri === source.uri);
    if (cacheIdx > -1) {
      let { error, loading, path, trying } = cacheImages[cacheIdx];
      if (!loading && !error && !!path) {
        meta.error = false;
        meta.loading = false;
        if (!!path) {
          meta.imageUri = { uri: path };
        }
      } else if (!!loading && !!error && trying <= 3 && !path) {
        getImage(source);
      } else if (!loading && !!error && trying > 3) {
        meta.error = true;
        meta.loading = false;
      }
    }
  }, [libsStorage.cacheImages]);

  console.log("images", meta.loading);

  return (
    <>
      <Thumbnail
        {...props}
        meta={meta}
        cstyle={cstyle}
        loadingStyle={loadingStyle}
      />
      <PreviewImage
        {...props}
        meta={meta}
        cstyle={cstyle}
        loadingStyle={loadingStyle}
      />
    </>
  );
});

const Thumbnail = observer((props: any) => {
  const { preview, meta, cstyle, loadingStyle }: any = props;
  const btnStyle: ViewStyle = {
    padding: 0,
    margin: 0,
    paddingHorizontal: 0,
    backgroundColor: "transparent",
    opacity: !preview ? 1 : undefined,
    width: _.get(cstyle, "width", "100%"),
    height: _.get(cstyle, "height", "100%"),
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  };
  const onPress = () => {
    meta.show = true;
  };
  const resizeMode = meta.loading
    ? "contain"
    : _.get(props, "resizeMode", "contain");
  const style = meta.loading ? loadingStyle : cstyle;
  const source = !!meta.imageUri ? meta.imageUri : Theme.UIImageLoading;

  return (
    <>
      {!meta.error ? (
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
            resizeMode={resizeMode}
            source={source}
            style={style}
          />
          {meta.loading && (
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
              <Spinner />
              <Text
                style={{
                  fontSize: 10,
                  marginLeft: 5,
                  marginTop: 2,
                }}
              >
                Downloading
              </Text>
            </View>
          )}
          {!meta.loading && !!props.caption && (
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
      ) : (
        <View style={btnStyle}>
          <Image
            defaultSource={Theme.UIImageLoading}
            {...props}
            resizeMode={"contain"}
            source={Theme.UIImageError}
            style={loadingStyle}
          />
        </View>
      )}
    </>
  );
});

const PreviewImage = observer((props: any) => {
  const { meta, cstyle, loadingStyle } = props;
  const onRequestClose = () => {
    meta.show = false;
  };
  // const csource = typeof source === "object" ? meta.imageUri : source;
  const resizeMode = !!meta.loading
    ? "contain"
    : _.get(props, "resizeMode", "contain");
  const style = !!meta.loading ? loadingStyle : cstyle;

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
          {...props}
          resizeMode={resizeMode}
          source={meta.imageUri}
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
