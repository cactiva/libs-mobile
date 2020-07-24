import { Camera, CameraProps } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";
import _ from "lodash";
import { toJS } from "mobx";
import { observer, useObservable } from "mobx-react-lite";
import React, { useEffect, useRef } from "react";
import {
  AsyncStorage,
  Dimensions,
  ImageProps,
  Platform,
  ViewStyle,
  Animated,
} from "react-native";
import Theme from "../../theme";
import Button from "../Button";
import Icon, { IIconProps } from "../Icon";
import Image from "../Image";
import Modal from "../Modal";
import Spinner from "../Spinner";
import Text from "../Text";
import View from "../View";

const storage = AsyncStorage;

interface IStyles {
  preview?: ViewStyle;
  icon?: ViewStyle;
}

export interface ICameraProps {
  value?: any;
  style?: ViewStyle;
  onCapture?: (value: any) => void;
  styles?: IStyles;
  previewProps?: ImageProps;
  iconProps?: IIconProps;
  cameraProps?: CameraProps;
  cameraTools?: {
    ratio?: boolean;
    flash?: boolean;
    picker?: boolean;
    reverse?: boolean;
  };
  editable?: boolean;
}

export default observer((props: ICameraProps) => {
  const { style, value, previewProps, iconProps, editable, onCapture } = props;
  const meta = useObservable({
    hasCameraPermission: null,
    hasImagePickPermission: null,
    isShown: false,
    resnap: false,
    snap: false,
  });
  const requestPermission = () => {
    let permissionsRequest = [Permissions.CAMERA] as any;
    if (Platform.OS === "ios") {
      permissionsRequest.push(Permissions.CAMERA_ROLL);
    }
    Permissions.getAsync(...permissionsRequest).then((res) => {
      Object.keys(res.permissions).map((key: any) => {
        if (res.permissions[key].status !== "granted") {
          Permissions.askAsync(key);
        } else {
          if (key == Permissions.CAMERA) {
            meta.hasCameraPermission = true;
          } else if (key == Permissions.CAMERA_ROLL) {
            meta.hasImagePickPermission = true;
          }
        }
      });
    });
  };
  const camera = useRef(null as any);
  const dim = Dimensions.get("window");
  const width = (style && style.width) || dim.width;
  const height = (style && style.height) || 120;
  const baseStyle: any = {
    ...Theme.UIInput,
    height: height,
    backgroundColor: "#a2a4ab",
    overflow: "hidden",
    paddingHorizontal: 0,
    ...style,
  };
  const iconStyle = {
    ...Theme.UIShadow,
    ..._.get(props, "styles.icon", {}),
  };
  const previewStyle = {
    height: height,
    width: width,
    flex: 1,
    overflow: "hidden",
    ..._.get(props, "styles.preview", {}),
  };

  useEffect(() => {
    requestPermission();
  }, []);
  if (
    meta.hasCameraPermission === false ||
    (Platform.OS === "ios" && meta.hasImagePickPermission === false)
  ) {
    return (
      <Button
        mode={"outlined"}
        label="Request Camera Permission"
        onPress={requestPermission}
      />
    );
  }
  const source = {
    cache: "reload",
    ...(_.get(previewProps, "source", {}) as any),
    uri: value,
  };
  return (
    <>
      <Button
        mode={"clean"}
        style={baseStyle}
        onPress={() => (meta.isShown = true)}
        disabled={editable === false && !value}
      >
        {!!value ? (
          <Image
            resizeMode="cover"
            style={previewStyle}
            {...previewProps}
            source={source}
            disableLoading
          />
        ) : (
          <Icon
            source="Entypo"
            name="camera"
            size={45}
            color="white"
            style={iconStyle}
            {...iconProps}
          />
        )}
      </Button>
      <CameraPicker {...props} state={meta} camera={camera} />
    </>
  );
});

const CameraPicker = observer((props: any) => {
  const { state, cameraProps, value, editable, camera, onCapture } = props;
  const meta = useObservable({
    cameraProps: {
      type: Camera.Constants.Type.back,
      ratio: "16:9",
      flashMode: "auto",
    },
  });
  const backgroundColor = new Animated.Value(0);
  const setCameraProps = async () => {
    let camProps = { ...meta.cameraProps, ...cameraProps };
    await storage.getItem("cameraProps").then((res) => {
      if (!!res) {
        camProps = { ...camProps, ...JSON.parse(res) };
      }
    });
    meta.cameraProps = camProps;
    storage.setItem("cameraProps", JSON.stringify(camProps));
  };
  const imageSnap = async () => {
    if (!!value && !state.resnap) {
      state.resnap = true;
    } else if (camera.current) {
      Animated.timing(backgroundColor, {
        toValue: 100,
        duration: 1000,
        useNativeDriver: false,
      }).start();
      let param: any = {
        quality: 0.8,
        base64: false,
      };
      await camera.current.takePictureAsync(param).then((res) => {
        !!state.resnap && (state.resnap = false);
        onCapture && onCapture(res.uri);
        state.isShown = false;
      });
    }
  };
  const imagePicker = async () => {
    ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 0.8,
    }).then((res: any) => {
      if (res.cancelled === false) {
        onCapture && onCapture(res.uri);
        state.isShown = false;
        !!state.resnap && (state.resnap = false);
      }
    });
  };
  useEffect(() => {
    setCameraProps();
  }, []);
  const bg = backgroundColor.interpolate({
    inputRange: [0, 0, 100],
    outputRange: ["rgba(0,0,0,0)", "rgb(255,255,255)", "rgba(0,0,0,0)"],
  });
  return (
    <Modal
      visible={state.isShown}
      onRequestClose={() => {
        state.isShown = false;
      }}
      screenProps={{
        style: {
          backgroundColor: "black",
        },
        styles: {
          statusbar: {
            backgroundColor: "black",
          },
        },
      }}
    >
      <View
        style={{
          flexDirection: "row",
          flexGrow: 1,
          paddingHorizontal: 15,
          maxHeight: 44,
        }}
      >
        <Button
          mode={"clean"}
          style={{
            margin: 0,
            padding: 0,
            paddingHorizontal: 0,
            minWidth: 44,
          }}
          onPress={() => {
            state.isShown = false;
          }}
        >
          <Icon source="AntDesign" name="arrowleft" color="white" size={24} />
        </Button>
        <CameraToolsTop
          value={value}
          state={meta}
          cameraTools={_.get(props, "cameraTools", {})}
        />
      </View>
      <CameraView camera={camera} meta={meta} {...props} />
      <Animated.View
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          backgroundColor: bg,
        }}
      />
      <CameraToolsBottom
        imagePicker={imagePicker}
        meta={meta}
        cameraTools={_.get(props, "cameraTools", {})}
        value={value}
        state={state}
      />
      <CameraAction
        imageSnap={imageSnap}
        state={state}
        value={value}
        editable={editable}
      />
    </Modal>
  );
});

const CameraToolsTop = observer((props: any) => {
  const { state, cameraTools, value } = props;
  if (!!value && !state.resnap) return null;

  const handleFlash = () => {
    if (state.cameraProps.flashMode === "auto") {
      state.cameraProps.flashMode = "on";
    } else if (state.cameraProps.flashMode === "on") {
      state.cameraProps.flashMode = "off";
    } else {
      state.cameraProps.flashMode = "auto";
    }
    storage.setItem("cameraProps", JSON.stringify(toJS(state.cameraProps)));
  };
  const handleRatio = () => {
    if (state.cameraProps.ratio === "1:1") {
      state.cameraProps.ratio = "4:3";
    } else if (state.cameraProps.ratio === "4:3") {
      state.cameraProps.ratio = "16:9";
    } else {
      state.cameraProps.ratio = "1:1";
    }
    storage.setItem("cameraProps", JSON.stringify(toJS(state.cameraProps)));
  };
  return (
    <View
      style={{
        flexDirection: "row",
        flexGrow: 1,
        justifyContent: "flex-end",
        maxHeight: 44,
      }}
    >
      {!!_.get(cameraTools, "ratio", true) && (
        <Button
          mode={"clean"}
          onPress={handleRatio}
          style={{
            minWidth: 44,
            margin: 0,
            paddingHorizontal: 10,
          }}
        >
          <Text
            style={{
              color: "white",
              fontSize: 14,
              fontWeight: "bold",
            }}
          >
            {state.cameraProps.ratio}
          </Text>
        </Button>
      )}
      {!!_.get(cameraTools, "flash", true) && (
        <Button
          mode={"clean"}
          onPress={handleFlash}
          style={{
            minWidth: 44,
            margin: 0,
            paddingHorizontal: 10,
          }}
        >
          {state.cameraProps.flashMode === "auto" ? (
            <>
              <Icon
                source="Ionicons"
                name="ios-flash"
                color="white"
                size={22}
              />
              <Text
                style={{
                  color: "white",
                  fontSize: 14,
                  fontWeight: "bold",
                }}
              >
                Auto
              </Text>
            </>
          ) : state.cameraProps.flashMode === "on" ? (
            <Icon source="Ionicons" name="ios-flash" color="white" size={26} />
          ) : (
            <Icon
              source="Ionicons"
              name="ios-flash-off"
              color="white"
              size={26}
            />
          )}
        </Button>
      )}
    </View>
  );
});

const CameraToolsBottom = observer((props: any) => {
  const { imagePicker, meta, cameraTools, value, state } = props;
  if (!!value && !state.resnap) return null;
  const handleReverse = () => {
    meta.cameraProps.type =
      meta.cameraProps.type === Camera.Constants.Type.back
        ? Camera.Constants.Type.front
        : Camera.Constants.Type.back;
  };
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 30,
        backgroundColor: "rgba(0,0,0,0.4)",
      }}
    >
      {!!_.get(cameraTools, "picker", true) && (
        <Button
          mode={"clean"}
          onPress={imagePicker}
          style={{
            flexGrow: 0,
            paddingHorizontal: 10,
          }}
        >
          <Icon source="Ionicons" name="md-images" color="white" size={35} />
        </Button>
      )}
      <View
        style={{
          flexGrow: 1,
          justifyContent: "flex-end",
        }}
      >
        {!!_.get(cameraTools, "reverse", true) && (
          <Button
            mode={"clean"}
            onPress={handleReverse}
            style={{
              flexGrow: 0,
              paddingHorizontal: 10,
              alignSelf: "flex-end",
            }}
          >
            <Icon
              source="Ionicons"
              name="ios-reverse-camera"
              color="white"
              size={45}
            />
          </Button>
        )}
      </View>
    </View>
  );
});

const CameraAction = observer((props: any) => {
  const { imageSnap, state, value, editable } = props;
  if (editable === false) return null;

  return (
    <Button
      mode={"clean"}
      style={{
        borderWidth: 2,
        borderColor: "white",
        borderStyle: "solid",
        borderRadius: 100,
        alignSelf: "center",
        padding: 0,
        paddingHorizontal: 0,
        position: "absolute",
        bottom: 0,
      }}
      disabled={state.snap}
      onPress={imageSnap}
    >
      <View
        style={{
          backgroundColor: "white",
          height: 50,
          width: 50,
          margin: 4,
          borderRadius: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {!!value && !state.resnap && (
          <Icon
            source="Ionicons"
            name="ios-refresh"
            size={26}
            color={"black"}
          />
        )}
      </View>
    </Button>
  );
});

const CameraView = observer((props: any) => {
  const { meta, state, camera, value } = props;
  const dim = Dimensions.get("window");
  const getRatio = () => {
    const ratio = _.get(meta, "cameraProps.ratio", "16:9").split(":");
    return {
      width: dim.width,
      height: (dim.width / parseInt(ratio[1])) * parseInt(ratio[0]),
    };
  };
  if (!!value && !state.resnap)
    return (
      <Image
        source={{ uri: value }}
        resizeMode="cover"
        style={{
          ...getRatio(),
        }}
      />
    );
  return (
    <Camera
      {...meta.cameraProps}
      style={{
        opacity: state.snap ? 0.6 : 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
        ...getRatio(),
      }}
      ref={camera}
    >
      {state.snap && <Spinner color={"white"} size="large" />}
    </Camera>
  );
});
