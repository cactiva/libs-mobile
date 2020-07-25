import store from "@src/libs/store";
import Constants from "expo-constants";
import * as FileSystem from "expo-file-system";
import _ from "lodash";
import { observer } from "mobx-react-lite";
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

interface IStyle {
  preview?: ViewStyle;
  caption?: TextStyle;
}

const storage = store("fs.image", {});
const callback = (downloadProgress, uri) => {
  const progress =
    downloadProgress.totalBytesWritten /
    downloadProgress.totalBytesExpectedToWrite;
  _.set(storage[uri], "progress", progress);
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
    if (_.get(storage[uri], "progress", 0) < 1) {
      downloadImage(uri, pathFile, downloadResumable.savable());
    } else {
      storage[uri] = {
        error: false,
        loading: false,
        uri: res.uri,
      };
    }
  } catch (error) {
    console.log(error);
    storage[uri] = {
      error: true,
      loading: false,
    };
  }
};

const getImage = async (uri) => {
  if (!!storage[uri]) {
    return;
  }
  storage[uri] = {};
  try {
    if (uri.indexOf("file://") > -1) {
      storage[uri] = {
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
      storage[uri] = {
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
    const { exists, size }: any = await FileSystem.getInfoAsync(pathFile).catch(
      (error) => {
        console.log(error);
      }
    );
    if (!!exists) {
      storage[uri] = {
        error: false,
        loading: false,
        uri: pathFile,
      };
    } else {
      downloadImage(uri, pathFile);
    }
  } catch (error) {
    console.log(error);
    storage[uri] = {
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
  const { style, source, preview, disableLoading }: any = props;
  const [loading, setLoading] = useState(
    disableLoading === true ? false : true
  );
  const [error, setError] = useState(false);
  const [show, setShow] = useState(false);
  const [imageUri, setImage] = useState(Theme.UIImageLoading);
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
      // backgroundColor: "#fff",
      alignSelf: "center",
      width,
    },
  ]);
  // let csource: any = source;
  // if (typeof source === "object") {
  //   csource = {
  //     ...source,
  //     cache: "force-cache",
  //   };
  // }

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
    setShow(!show);
  };

  useEffect(() => {
    if (typeof source === "object") {
      getImage(source.uri);
    }
  }, [source]);

  useEffect(() => {
    if (!!storage[source.uri]) {
      let { error, loading, uri } = storage[source.uri];
      setError(error);
      setLoading(loading);
      if (!!uri) setImage({ uri });

      setTimeout(() => {
        delete storage[uri];
      }, 5000);
    }
  }, [storage[source.uri]]);

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
          <Image
            defaultSource={Theme.UIImageLoading}
            {...props}
            resizeMode={
              !!loading ? "contain" : _.get(props, "resizeMode", "contain")
            }
            source={typeof source === "object" ? imageUri : source}
            style={!!loading ? loadingStyle : cstyle}
            // onError={(e) => {
            //   const err = _.get(e, "nativeEvent.error", "");
            //   if (!!err) setError(true);
            // }}
            // onLoadEnd={() => {
            //   setLoading(false);
            // }}
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
      <PreviewImage show={show} setShow={setShow} imgProps={props} />
    </>
  );
});

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
};
