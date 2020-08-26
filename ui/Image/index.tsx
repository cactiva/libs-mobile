import Constants from "expo-constants";
import * as FileSystem from "expo-file-system";
import _ from "lodash";
import { toJS } from "mobx";
import { observer, useObservable } from "mobx-react-lite";
import { observable } from "mobx";
import Path from "path";
import React, { useEffect } from "react";
import {
  Dimensions,
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
import libsStorage from "../store";
import Text from "../Text";
import View from "../View";
import bytes from "@src/libs/utils/bytes";
import Spinner from "../Spinner";

interface IStyle {
  preview?: ViewStyle;
  caption?: TextStyle;
}
let downloadResumable;

const setCached = (uri: string, data: object) => {
  const fileName = Path.basename(uri);
  libsStorage.cacheImages[fileName] = data;
};

const getCached = (uri: string) => {
  const fileName = Path.basename(uri);
  return !!libsStorage.cacheImages[fileName]
    ? toJS(libsStorage.cacheImages[fileName])
    : {};
};

const clearIncompleteImage = async (uri) => {
  let cacheImage = getCached(uri);
  // if (!!downloadResumable) {
  //   downloadResumable.pauseAsync();
  //   cacheImage.resumeData = downloadResumable.savable();
  // }
  cacheImage = {
    ...cacheImage,
    loading: false,
  };
  setCached(uri, cacheImage);
};

const callback = (downloadProgress, uri) => {
  let cacheImage = getCached(uri);
  let progress =
    downloadProgress.totalBytesWritten /
    downloadProgress.totalBytesExpectedToWrite;
  let resumeData = null;
  if (!!downloadResumable) {
    resumeData = downloadResumable.savable();
  }
  cacheImage = {
    ...cacheImage,
    progress,
    resumeData,
    totalBytesWritten: downloadProgress.totalBytesWritten,
  };
  setCached(uri, cacheImage);
};

const downloadImage = async (uri, pathFile, resumeData = null) => {
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
      }
    );
  }
  try {
    let res;
    if (!resumeData) {
      res = await downloadResumable.downloadAsync();
    } else {
      res = await downloadResumable.resumeAsync();
    }
    let cacheImage = getCached(uri);
    if (res.status == 200) {
      cacheImage = {
        ...cacheImage,
        error: false,
        loading: false,
        path: res.uri,
        resumeData: null,
      };
      setCached(uri, cacheImage);
    } else if (res.status != 200) {
      cacheImage = {
        ...cacheImage,
        error: true,
        resumeData: downloadResumable.savable(),
      };
      setCached(uri, cacheImage);
    }
  } catch (error) {
    let cacheImage = getCached(uri);
    cacheImage = {
      ...cacheImage,
      error: true,
      loading: false,
    };
    setCached(uri, cacheImage);
    console.log(error);
  }
};

const getImage = async ({ uri, cache }) => {
  try {
    const fileName = Path.basename(uri);
    const ext = Path.extname(uri);
    const pathDir = FileSystem.cacheDirectory + Constants.manifest.slug + "/";
    const pathFile = pathDir + fileName;

    if (!ext) {
      let cacheImage = getCached(uri);
      cacheImage = {
        ...cacheImage,
        error: true,
        loading: false,
      };
      setCached(uri, cacheImage);
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
    let cacheImage = getCached(uri);
    if (
      !!exists &&
      cacheImage.totalBytesWritten > 0 &&
      !cacheImage.error &&
      (!cacheImage.resumeData || cacheImage.progress == 1) &&
      cache != "reload"
    ) {
      let cacheImage = getCached(uri);
      cacheImage = {
        ...cacheImage,
        loading: false,
        path: pathFile,
      };
      setCached(uri, cacheImage);
      return;
    } else {
      let cacheImage = getCached(uri);
      if (!!cacheImage && !!cacheImage.error) {
        cacheImage.trying += 1;
        if (cacheImage.trying >= 3) {
          cacheImage = {
            ...cacheImage,
            error: true,
            loading: false,
          };
          setCached(uri, cacheImage);
          return;
        } else if (
          cacheImage.progress > 0 &&
          cacheImage.progress < 1 &&
          !!cacheImage.resumeData
        ) {
          setCached(uri, cacheImage);
          await downloadImage(uri, pathFile, cacheImage.resumeData);
          return;
        }
      }
      await downloadImage(uri, pathFile);
      return;
    }
  } catch (error) {
    let cacheImage = getCached(uri);
    cacheImage = {
      ...cacheImage,
      error: true,
      loading: false,
    };
    setCached(uri, cacheImage);
    console.log(error);
  }
};

export interface IImageProps extends OriginImageProps {
  preview?: boolean;
  styles?: IStyle;
  disableLoading?: boolean;
  caption?: string;
  enableProgress?: boolean;
}

export default observer((props: IImageProps) => {
  const { source, disableLoading, style }: any = props;
  const meta = useObservable({
    error: false,
    show: false,
    loading: disableLoading === true ? false : true,
    imageUri: source || Theme.UIImageLoading,
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
    if (typeof libsStorage.cacheImages !== "object") {
      libsStorage.cacheImages = {};
    }
    if (typeof source === "object" && source.uri.indexOf("http") > -1) {
      let cacheImage = getCached(source.uri);
      if (!!cacheImage.uri && cacheImage.trying < 3 && !!cacheImage.loading) {
        getImage(source);
      } else if (!cacheImage.uri || cacheImage.trying > 3) {
        cacheImage = {
          uri: source.uri,
          error: false,
          loading: true,
          trying: 1,
        };
        setCached(source.uri, cacheImage);
        getImage(source);
      }
    } else if (
      (typeof source === "object" && source.uri.indexOf("file://") > -1) ||
      typeof source === "number"
    ) {
      meta.loading = false;
      meta.imageUri = source;
    }
    // return () => {
    //   clearIncompleteImage(source.uri);
    // };
  }, [source]);

  useEffect(() => {
    let cacheImage = getCached(source.uri);
    if (!!cacheImage.uri) {
      let { error, loading, path, trying } = cacheImage;
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
  }, [getCached(source.uri)]);

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
    width: _.get(cstyle, "width", undefined),
    height: _.get(cstyle, "height", undefined),
    justifyContent: "center",
    alignItems: "center",
    // flex: 1,
  };
  const onPress = () => {
    meta.show = true;
  };
  const resizeMode = meta.loading
    ? "contain"
    : _.get(props, "resizeMode", "contain");
  const style = meta.loading ? loadingStyle : cstyle;

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
            source={meta.imageUri}
            style={style}
          />
          <LoadingProgress {...props} mode={"thumbnail"} />
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

const LoadingProgress = observer((props: any) => {
  const { meta, source, mode, enableProgress } = props;
  let cacheImage = getCached(source.uri);
  let progress =
    cacheImage.progress > 0
      ? cacheImage.progress * 100
      : bytes(cacheImage.totalBytesWritten || 0, 1);
  if (!!enableProgress && !!meta.loading && mode === "thumbnail") {
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
          {progress}
        </Text>
      </View>
    );
  }
  if (!!enableProgress && !!meta.loading && mode === "preview") {
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
          Downloading... {progress}
        </Text>
      </View>
    );
  }
  return null;
});

const PreviewImage = observer((props: any) => {
  const { meta, cstyle, loadingStyle } = props;
  const dim = Dimensions.get("window");
  const onRequestClose = () => {
    meta.show = false;
  };
  const resizeMode = "contain";
  const previewStyle = StyleSheet.flatten([
    cstyle,
    {
      width: dim.width,
      height: dim.height,
    },
  ]);
  const style = !!meta.loading ? loadingStyle : previewStyle;

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
