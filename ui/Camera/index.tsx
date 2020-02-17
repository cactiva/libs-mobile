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
  Dimensions,
  Platform
} from "react-native";
import { DefaultTheme, ThemeProps } from "../../themes";
import Icon from "../Icon";
import Spinner from "../Spinner";
import { toJS } from "mobx";
import * as ImagePicker from "expo-image-picker";

export interface CameraProps {
  value?: any;
  option?: any;
  style?: any;
  theme?: ThemeProps;
  onCapture?: (value: any) => void;
  imagePicker?: boolean;
}

export default observer((props: CameraProps) => {
  const { style, value } = props;
  const meta = useObservable({
    hasCameraPermission: null,
    hasImagePickPermission: true,
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
    meta.photo = value;
    Permissions.askAsync(Permissions.CAMERA).then((res: any) => {
      meta.hasCameraPermission = res.status === "granted";
    });
    if (Platform.OS === "ios") {
      meta.hasImagePickPermission = false;
      Permissions.askAsync(Permissions.CAMERA_ROLL).then(res => {
        meta.hasImagePickPermission = res.status === "granted";
      });
    }
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
              source={{ uri: value ? value : meta.photo }}
              resizeMode="cover"
              style={{
                height: height,
                width: width,
                flexGrow: 1,
                flexShrink: 1,
                margin: 0
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
          state={meta}
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
  const { state, camera, theme, dim, onCapture, imagePicker } = props;
  const getRatio = () => {
    const ratio = state.cameraProps.ratio.split(":");
    return {
      width: dim.width,
      height: (dim.width / parseInt(ratio[1])) * parseInt(ratio[0])
    };
  };

  const snap = () => {
    if (state.photo && !state.resnap) {
      state.resnap = true;
    } else if (camera.current) {
      state.snap = true;
      camera.current
        .takePictureAsync({ quality: 0.8, skipProcessing: true })
        .then((res: any) => {
          state.photo = res.uri;
          onCapture && onCapture(res.uri);
          state.snap = false;
          state.isShown = false;
          state.resnap = false;
        });
    }
  };
  const pick = async () => {
    if (!state.hasImagePickPermission) {
      alert("No access to Album");
      return;
    }
    ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8
    }).then((res: any) => {
      state.photo = res.uri;
      onCapture && onCapture(res.uri);
      state.snap = false;
      state.isShown = false;
      state.resnap = false;
    });
  };
  const capture = !state.photo || state.resnap;
  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={state.isShown}
      onRequestClose={() => {
        state.isShown = false;
        state.resnap = false;
        state.snap = false;
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
              width: 50,
              height: 50
            }}
            onPress={() => {
              state.snap = false;
              state.isShown = false;
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
          {!!state.photo && !state.resnap ? (
            <Image
              source={{ uri: state.photo }}
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
                flexGrow: 1,
                opacity: state.snap ? 0.6 : 1,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "transparent"
              }}
              ref={camera}
              {...state.cameraProps}
            >
              {state.snap && <Spinner color={theme.primary} size="large" />}
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
            padding: 10,
            backgroundColor: "rgba(0,0,0,0.7)",
            height: 100
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
                  if (state.cameraProps.flashMode === "auto") {
                    state.cameraProps.flashMode = "on";
                  } else if (state.cameraProps.flashMode === "on") {
                    state.cameraProps.flashMode = "off";
                  } else {
                    state.cameraProps.flashMode = "auto";
                  }
                }}
              >
                {state.cameraProps.flashMode === "auto" ? (
                  <Text
                    style={{
                      color: "white",
                      fontSize: 16,
                      fontWeight: "bold"
                    }}
                  >
                    Auto
                  </Text>
                ) : state.cameraProps.flashMode === "on" ? (
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
              position: "absolute",
              bottom: 10,
              left: 0,
              right: 0,
              flexGrow: 1
            }}
          >
            <TouchableOpacity
              style={{
                borderWidth: 1,
                borderColor: "white",
                borderStyle: "solid",
                backgroundColor: "transparent",
                borderRadius: 100,
                alignSelf: "center"
              }}
              disabled={state.snap}
              onPress={snap}
            >
              <View
                style={{
                  backgroundColor: "white",
                  height: 60,
                  width: 60,
                  margin: 4,
                  borderRadius: 100,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {state.photo && !state.resnap && (
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
                  state.cameraProps.type =
                    state.cameraProps.type === Camera.Constants.Type.back
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
                  size={35}
                />
              </TouchableOpacity>
            </View>
          )}
          {imagePicker && (
            <TouchableOpacity
              onPress={pick}
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
                name="md-images"
                color="white"
                size={35}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
});
