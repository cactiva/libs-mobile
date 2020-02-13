import { Camera } from "expo-camera";
import * as Permissions from "expo-permissions";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect, useRef } from "react";
import {
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
  Dimensions
} from "react-native";
import { DefaultTheme, ThemeProps } from "../../themes";
import Icon from "../Icon";
import Spinner from "../Spinner";

export interface CameraProps {
  value?: any;
  option?: any;
  style?: any;
  theme?: ThemeProps;
  onCapture?: (value: any) => void;
}

export default observer((props: CameraProps) => {
  const { style, value } = props;
  const meta = useObservable({
    hasCameraPermission: null,
    isShown: false,
    cameraProps: {
      type: Camera.Constants.Type.back,
      ratio: "16:9",
      flashMode: "auto"
    },
    snap: false,
    photo: null,
    resnap: false
  });
  const dim = Dimensions.get("window");
  const width = (style && style.width) || 150;
  const height = (style && style.height) || dim.width;
  useEffect(() => {
    Permissions.askAsync(Permissions.CAMERA).then((res: any) => {
      meta.hasCameraPermission = res.status === "granted";
    });
  }, []);

  const camera = useRef(null);
  const theme = {
    ...DefaultTheme,
    ...props.theme
  };
  if (meta.hasCameraPermission === null) {
    return <View />;
  } else if (meta.hasCameraPermission === false) {
    return <Text style={{ padding: 10 }}>No access to camera</Text>;
  } else {
    return (
      <>
        <TouchableOpacity
          onPress={() => (meta.isShown = true)}
          style={{
            flex: 1,
            height: 100,
            backgroundColor: theme.medium,
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 4,
            overflow: "hidden",
            ...style
          }}
        >
          {(meta.photo || value) && (
            <Image
              source={{ uri: meta.photo ? meta.photo.uri : value }}
              resizeMode="cover"
              style={{
                height: height,
                width: width,
                flexGrow: 1,
                flexShrink: 1
              }}
            />
          )}
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              display: "flex",
              zIndex: 1,
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0
            }}
          >
            <Icon
              source="Entypo"
              name="camera"
              size={45}
              color="white"
              style={{
                shadowColor: "#000",
                shadowOffset: {
                  width: 0,
                  height: 2
                },
                shadowOpacity: 0.25,
                shadowRadius: 3.84,
                elevation: 5
              }}
            />
          </View>
        </TouchableOpacity>
        <ModalCamera
          meta={meta}
          camera={camera}
          theme={theme}
          dim={dim}
          {...props}
        />
      </>
    );
  }
});

const ModalCamera = observer((props: any) => {
  const { meta, camera, theme, dim, onCapture } = props;
  const getRatio = () => {
    const ratio = meta.cameraProps.ratio.split(":");
    return {
      width: dim.width,
      height: (dim.width / parseInt(ratio[1])) * parseInt(ratio[0])
    };
  };

  const snap = () => {
    if (meta.photo && !meta.resnap) {
      meta.resnap = true;
    } else if (camera.current) {
      meta.snap = true;
      camera.current
        .takePictureAsync({ quality: 80, skipProcessing: true })
        .then((res: any) => {
          meta.photo = res;
          onCapture && onCapture(res.uri);
          meta.snap = false;
          meta.isShown = false;
          meta.resnap = false;
        });
    }
  };
  const capture = !meta.photo || meta.resnap;

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={meta.isShown}
      onRequestClose={() => {
        meta.isShown = false;
        meta.resnap = false;
        meta.snap = false;
      }}
    >
      <View
        style={{
          flex: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: "column",
          backgroundColor: theme.dark
        }}
      >
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-start",
            zIndex: 1,
            paddingLeft: 5,
            paddingRight: 5
          }}
        >
          <TouchableOpacity
            style={{
              padding: 10,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: 40
            }}
            onPress={() => {
              meta.snap = false;
              meta.isShown = false;
            }}
          >
            <Icon source="AntDesign" name="arrowleft" color="white" size={24} />
          </TouchableOpacity>
        </View>
        <View
          style={{
            ...getRatio(),
            backgroundColor: "white"
          }}
        >
          {meta.photo && !meta.resnap ? (
            <Image
              source={{ uri: meta.photo.uri }}
              resizeMode="cover"
              style={{
                height: 100,
                width: dim.width,
                flexGrow: 1,
                flexShrink: 1,
                flexBasis: 0
              }}
            />
          ) : (
            <Camera
              style={{
                flex: 1,
                opacity: meta.snap ? 0.6 : 1,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "transparent"
              }}
              ref={camera}
              {...meta.cameraProps}
            >
              {meta.snap && <Spinner color={theme.primary} size="large" />}
            </Camera>
          )}
        </View>
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "stretch",
            zIndex: 1,
            marginBottom: 10,
            paddingLeft: 5,
            paddingRight: 5
          }}
        >
          {capture && (
            <View
              style={{
                flex: 1,
                display: "flex",
                justifyContent: "flex-start",
                flexDirection: "row",
                alignItems: "center"
              }}
            >
              <TouchableOpacity
                style={{
                  padding: 10,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: 60
                }}
                onPress={() => {
                  if (meta.cameraProps.flashMode === "auto") {
                    meta.cameraProps.flashMode = "on";
                  } else if (meta.cameraProps.flashMode === "on") {
                    meta.cameraProps.flashMode = "off";
                  } else {
                    meta.cameraProps.flashMode = "auto";
                  }
                }}
              >
                {meta.cameraProps.flashMode === "auto" ? (
                  <Text
                    style={{
                      color: "white",
                      fontSize: 16,
                      fontWeight: "bold"
                    }}
                  >
                    Auto
                  </Text>
                ) : meta.cameraProps.flashMode === "on" ? (
                  <Icon
                    source="Ionicons"
                    name="ios-flash"
                    color="white"
                    size={40}
                  />
                ) : (
                  <Icon
                    source="Ionicons"
                    name="ios-flash-off"
                    color="white"
                    size={40}
                  />
                )}
              </TouchableOpacity>
            </View>
          )}

          <View
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              flexDirection: "row",
              alignItems: "center"
            }}
          >
            <TouchableOpacity
              style={{
                borderWidth: 1,
                borderColor: "white",
                borderStyle: "solid",
                backgroundColor: "transparent",
                borderRadius: 100
              }}
              disabled={meta.snap}
              onPress={snap}
            >
              <View
                style={{
                  backgroundColor: "white",
                  height: 80,
                  width: 80,
                  margin: 4,
                  borderRadius: 100,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {meta.photo && !meta.resnap && (
                  <Icon
                    source="Ionicons"
                    name="ios-refresh"
                    size={40}
                    color={theme.dark}
                  />
                )}
              </View>
            </TouchableOpacity>
          </View>
          {capture && (
            <View
              style={{
                flex: 1,
                display: "flex",
                justifyContent: "flex-end",
                flexDirection: "row",
                alignItems: "center"
              }}
            >
              <TouchableOpacity
                onPress={() => {
                  meta.cameraProps.type =
                    meta.cameraProps.type === Camera.Constants.Type.back
                      ? Camera.Constants.Type.front
                      : Camera.Constants.Type.back;
                }}
                style={{
                  padding: 10,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: 60
                }}
              >
                <Icon
                  source="Ionicons"
                  name="ios-reverse-camera"
                  color="white"
                  size={40}
                />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
});
