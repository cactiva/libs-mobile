import Constants from "expo-constants";
import * as FileSystem from "expo-file-system";
import _ from "lodash";
import { toJS } from "mobx";
import { observer, useObservable } from "mobx-react-lite";
import Path from "path";
import React, { useEffect } from "react";
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
import libsStorage from "../store";
import Text from "../Text";
import View from "../View";
import { Spinner } from "..";

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
    if (progress == 1 && res.status == 200) {
      let img = toJS(libsStorage.images[uri]);
      img = {
        ...img,
        error: false,
        loading: false,
        uri: res.uri,
      };
      libsStorage.images[uri] = img;
    } else if (progress > 0 && progress < 1) {
      await downloadImage(uri, pathFile, downloadResumable.savable());
    } else {
      let img = toJS(libsStorage.images[uri]);
      img = {
        ...img,
        resumeData: downloadResumable.savable(),
      };
      libsStorage.images[uri] = img;
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
  // try {
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
  if (!dirs && !Array.isArray(dirs)) {
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
    let img = toJS(libsStorage.images[uri]);
    if (!!img && !!img.error) {
      if (img.trying == undefined) {
        img.trying = 0;
      }
      img.trying += 1;
      img.loading = true;
      libsStorage.images[uri] = img;
      if (img.progress > 0 && img.progress < 1) {
        await downloadImage(uri, pathFile, img.resumeData);
      }
    } else {
      libsStorage.images[uri] = {
        error: false,
        loading: true,
        trying: 1,
      };
    }
    await downloadImage(uri, pathFile);
    return;
  }
  // } catch (error) {
  //   let img = toJS(libsStorage.images[uri]);
  //   img = {
  //     ...img,
  //     error: true,
  //     loading: false,
  //   };
  //   libsStorage.images[uri] = img;
  //   console.log(error);
  // }
};

const a = { i: 0 };
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
    imageUri: Theme.UIImageLoading,
  });

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

  useEffect(() => {
    if (typeof source === "object" && source.uri.indexOf("http")) {
      getImage(source);
    } else {
      meta.loading = false;
      meta.imageUri = source;
    }
  }, [source]);

  useEffect(() => {
    let img = toJS(libsStorage.images[source.uri]);
    if (!!img) {
      let { error, loading, uri, trying } = img;
      if (!loading && !error) {
        meta.error = error;
        meta.loading = loading;
        if (!!uri) {
          meta.imageUri = { uri };
        }
        delete libsStorage.images[source.uri];
      } else if (!loading && !!error && trying <= 3) {
        getImage(source);
      } else if (!loading && !!error) {
        meta.error = error;
        meta.loading = loading;
        delete libsStorage.images[source.uri];
      }
    }
  }, [libsStorage.images[source.uri]]);

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
  const { preview, meta, cstyle, loadingStyle, disableLoading }: any = props;

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
  const resizeMode = !!meta.loading
    ? "contain"
    : _.get(props, "resizeMode", "contain");
  const style = !!meta.loading ? loadingStyle : cstyle;

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
          resizeMode={resizeMode}
          source={meta.imageUri}
          style={style}
        />
        {disableLoading != true && !!meta.loading && (
          <View
            style={{
              backgroundColor: "white",
              flexDirection: "row",
              justifyContent: "center",
              alignItems: "center",
              padding: 5,
              position: "absolute",
              bottom: 5,
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
