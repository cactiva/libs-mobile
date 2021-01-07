import { Camera, CameraProps } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import get from "lodash.get";
import { runInAction, toJS } from "mobx";
import { observer, useLocalObservable } from "mobx-react-lite";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Image as RNImage,
  Platform,
  ViewStyle,
} from "react-native";
import { Permissions } from "react-native-unimodules";
import Theme from "../../config/theme";
import Button from "../Button";
import Icon, { IIconProps } from "../Icon";
import Image from "../Image";
import libsStorage from "../libsStorage";
import Modal from "../Modal";
import { statusBarHeight } from "../Screen";
import Spinner from "../Spinner";
import Text from "../Text";
import View from "../View";

const reSizeImage = (uri: string) => {
  return new Promise(async (resolve) => {
    try {
      const success = async (w: number, h: number) => {
        let width = w;
        let height = h;
        if (w > h && w > 1080) {
          width = 1080;
          height = width / (w / h);
        } else if (h > w && h > 1080) {
          height = 1080;
          width = height * (w / h);
        }
        await ImageManipulator.manipulateAsync(
          uri,
          [{ resize: { width, height } }],
          { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
        )
          .then((resizedPhoto: any) => {
            resolve(resizedPhoto.uri);
          })
          .catch((e: any) => {
            resolve(uri);
          });
      };
      RNImage.getSize(uri, success, (e) => {
        resolve(uri);
      });
    } catch (error) {
      resolve(uri);
    }
  });
};

interface IStyles {
  preview?: ViewStyle;
  icon?: ViewStyle;
}

export interface ICameraProps {
  value?: any;
  style?: ViewStyle;
  onCapture?: (value: any) => void;
  styles?: IStyles;
  iconProps?: IIconProps;
  cameraProps?: CameraProps;
  cameraTools?: {
    ratio?: boolean;
    flash?: boolean;
    picker?: boolean;
    reverse?: boolean;
  };
  editable?: boolean;
  compress?: boolean;
}

export default observer((props: ICameraProps) => {
  const { style, value, iconProps, editable } = props;
  const meta = useLocalObservable(() => ({
    isShown: false,
    loading: false,
    snap: false,
    tempValue: value,
  }));
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
          runInAction(() => {
            if (key == Permissions.CAMERA && !libsStorage.hasCameraPermission) {
              libsStorage.hasCameraPermission = true;
            } else if (
              key == Permissions.CAMERA &&
              !libsStorage.hasImagePickPermission
            ) {
              libsStorage.hasImagePickPermission = true;
            }
          });
        }
      });
    });
  };
  const height = style ? style.height : 120;
  const baseStyle: any = {
    ...Theme.UIInput,
    height: height,
    backgroundColor: "#a2a4ab",
    overflow: "hidden",
    paddingHorizontal: 0,
    ...style,
  };

  const onPress = () => {
    if (
      (Platform.OS == "android" && !!libsStorage.hasCameraPermission) ||
      (Platform.OS == "ios" &&
        !!libsStorage.hasCameraPermission &&
        !!libsStorage.hasImagePickPermission)
    ) {
      runInAction(() => (meta.isShown = true));
    } else {
      requestPermission();
    }
  };

  useEffect(() => {
    requestPermission();
    if (!value) {
      runInAction(() => (meta.snap = true));
    }
  }, []);

  if (
    (Platform.OS == "android" && libsStorage.hasCameraPermission == false) ||
    (Platform.OS == "ios" &&
      libsStorage.hasCameraPermission == false &&
      libsStorage.hasImagePickPermission == false)
  ) {
    return (
      <Button
        mode={"outlined"}
        label="Request Camera Permission"
        onPress={requestPermission}
      />
    );
  }
  return (
    <>
      <Button
        mode={"clean"}
        style={baseStyle}
        onPress={onPress}
        disabled={editable === false && !meta.tempValue}
      >
        <Preview
          meta={meta}
          camprops={props}
          height={height}
          iconProps={iconProps}
          baseStyle={baseStyle}
        />
      </Button>
      <CameraPicker {...props} meta={meta} />
    </>
  );
});

const Preview = observer((props: any) => {
  const { meta, iconProps, height, baseStyle } = props;
  const source = {
    uri: meta.tempValue,
  };
  const iconStyle = {
    ...Theme.UIShadow,
    ...get(props, "styles.icon", {}),
  };
  const previewStyle = {
    height,
    width: "100%",
    flex: 1,
    overflow: "hidden",
    ...get(props, "styles.preview", {}),
  };
  if (!!source.uri)
    return (
      <Image
        resizeMode="cover"
        style={previewStyle}
        source={source}
        disableLoading
      />
    );
  return (
    <Icon
      source="Entypo"
      name="camera"
      size={45}
      color="white"
      style={iconStyle}
      {...iconProps}
    />
  );
});

const CameraPicker = observer((props: any) => {
  const { value, onCapture, compress, meta } = props;
  const camera = useRef(null as any);
  const backgroundColor = new Animated.Value(0);
  const imageSnap = () => {
    try {
      if ((!!value || !!meta.tempValue) && !meta.snap) {
        runInAction(() => (meta.snap = true));
      } else if (!!camera.current) {
        runInAction(() => (meta.loading = true));
        Animated.timing(backgroundColor, {
          toValue: 100,
          duration: 1000,
          useNativeDriver: false,
        }).start();
        camera.current
          .takePictureAsync({
            quality: 0.8,
            base64: false,
          })
          .then(async (res: any) => {
            onRequestClose();
            let uri = res.uri;
            if (compress == true) {
              await reSizeImage(res.uri)
                .then((res) => {
                  uri = res;
                })
                .catch((e) => console.log(e));
            }
            if (typeof onCapture == "function") {
              onCapture(uri);
            }
            runInAction(() => (meta.tempValue = uri));
            runInAction(() => (meta.snap = false));
          })
          .catch((e: any) => {
            let msg = e.message;
            if (!msg) {
              msg = "Failed to take a picture. Please try again.";
            }
            alert(msg);
            onRequestClose();
          });
      }
    } catch (error) {
      let msg = error.message;
      if (!msg) {
        msg = "Failed to take a picture. Please try again.";
      }
      alert(msg);
      onRequestClose();
    }
  };
  const imagePicker = async () => {
    try {
      if ((!!value || !!meta.tempValue) && !meta.snap) {
        runInAction(() => (meta.snap = true));
      } else {
        runInAction(() => (meta.loading = true));
        ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: true,
          quality: 0.6,
        })
          .then((res) => {
            if (res.cancelled === false) {
              onRequestClose();
              runInAction(() => (meta.tempValue = res.uri));
              if (typeof onCapture == "function") {
                onCapture(res.uri);
              }
              runInAction(() => (meta.snap = false));
            }
          })
          .catch((error) => {
            let msg = error.message;
            if (!msg) {
              msg = "Failed to take a picture. Please try again.";
            }
            alert(msg);
            onRequestClose();
          });
      }
    } catch (error) {
      let msg = error.message;
      if (!msg) {
        msg = "Failed to take a picture. Please try again.";
      }
      alert(msg);
      onRequestClose();
    }
  };

  const onRequestClose = () => {
    runInAction(() => {
      meta.isShown = false;
      meta.snap = false;
      meta.loading = false;
    });
  };

  const cameraProps = {
    onMountError: (e: any) => {
      let msg = e.nativeEvent.message;
      if (!msg) {
        msg = "Camera preview cannot been started.";
      }
      alert(msg);
      onRequestClose();
    },
  };

  useEffect(() => {
    let camProps = {
      type: Camera.Constants.Type.back,
      ratio: "16:9",
      flashMode: "auto",
      ...get(props, "cameraProps", {}),
      ...get(libsStorage, "camera", {}),
    };
    runInAction(() => (libsStorage.camera = camProps));
  }, []);

  const bg = backgroundColor.interpolate({
    inputRange: [0, 0, 100],
    outputRange: ["rgba(0,0,0,0)", "rgb(255,255,255)", "rgba(0,0,0,0)"],
  });
  return (
    <Modal
      visible={meta.isShown}
      onRequestClose={onRequestClose}
      screenProps={{
        style: {
          backgroundColor: "black",
        },
      }}
    >
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 15,
          zIndex: 9,
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          paddingTop: statusBarHeight,
          backgroundColor: "rgba(0,0,0,1)",
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
          onPress={onRequestClose}
        >
          <Icon source="AntDesign" name="arrowleft" color="white" size={24} />
        </Button>
        <CameraToolsTop {...props} />
      </View>
      <CameraToolsBottom
        imageSnap={imageSnap}
        imagePicker={imagePicker}
        {...props}
      />
      <CameraView
        camera={camera}
        cameraProps={cameraProps}
        {...props}
        bg={bg}
      />
    </Modal>
  );
});

const RatioButton = observer(({ cameraTools }: any) => {
  let ratio = get(cameraTools, "ratio", true);
  const handleRatio = () => {
    runInAction(() => {
      if (libsStorage.camera.ratio === "1:1") {
        libsStorage.camera.ratio = "4:3";
      } else if (libsStorage.camera.ratio === "4:3") {
        libsStorage.camera.ratio = "16:9";
      } else {
        libsStorage.camera.ratio = "1:1";
      }
    });
  };
  if (!ratio) return null;
  return (
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
        {libsStorage.camera.ratio}
      </Text>
    </Button>
  );
});

const FlashButton = observer(({ cameraTools }: any) => {
  let flash = get(cameraTools, "flash", true);
  const handleFlash = () => {
    runInAction(() => {
      if (libsStorage.camera.flashMode === "auto") {
        libsStorage.camera.flashMode = "on";
      } else if (libsStorage.camera.flashMode === "on") {
        libsStorage.camera.flashMode = "off";
      } else {
        libsStorage.camera.flashMode = "auto";
      }
    });
  };
  if (!flash) return null;
  return (
    <Button
      mode={"clean"}
      onPress={handleFlash}
      style={{
        minWidth: 44,
        margin: 0,
        paddingHorizontal: 10,
      }}
    >
      {libsStorage.camera.flashMode === "auto" ? (
        <>
          <Icon source="Ionicons" name="ios-flash" color="white" size={22} />
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
      ) : libsStorage.camera.flashMode === "on" ? (
        <Icon source="Ionicons" name="ios-flash" color="white" size={26} />
      ) : (
        <Icon source="Ionicons" name="ios-flash-off" color="white" size={26} />
      )}
    </Button>
  );
});

const CameraToolsTop = observer((props: any) => {
  const { value, meta, cameraTools } = props;
  if (!!meta.tempValue && !meta.snap && !meta.loading) return null;

  return (
    <View
      style={{
        flexDirection: "row",
        flexGrow: 1,
        justifyContent: "flex-end",
        maxHeight: 44,
      }}
    >
      <RatioButton cameraTools={cameraTools} />
      <FlashButton cameraTools={cameraTools} />
    </View>
  );
});

const PickerButton = observer(({ cameraTools, imagePicker, meta }: any) => {
  let picker = get(cameraTools, "picker", true);
  if (!picker) return null;
  if (!!meta.tempValue && !meta.snap && !meta.loading) return null;

  return (
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
  );
});

const ReverseButton = observer(({ cameraTools, handleReverse, meta }: any) => {
  let reverse = get(cameraTools, "reverse", true);
  if (!reverse) return null;
  if (!!meta.tempValue && !meta.snap && !meta.loading) return null;

  return (
    <Button
      mode={"clean"}
      onPress={handleReverse}
      style={{
        flexGrow: 0,
        paddingHorizontal: 10,
        alignSelf: "flex-end",
      }}
    >
      <Icon source="Ionicons" name="camera-reverse" color="white" size={45} />
    </Button>
  );
});

const CameraToolsBottom = observer((props: any) => {
  const { imagePicker, cameraTools, meta } = props;
  const handleReverse = () => {
    runInAction(() => {
      libsStorage.camera.type =
        libsStorage.camera.type === Camera.Constants.Type.back
          ? Camera.Constants.Type.front
          : Camera.Constants.Type.back;
    });
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
        height: 70,
        paddingHorizontal: 15,
        backgroundColor: "rgba(0,0,0,1)",
        zIndex: 9,
      }}
    >
      <View style={{ width: 100 }}>
        <PickerButton
          cameraTools={cameraTools}
          imagePicker={imagePicker}
          meta={meta}
        />
      </View>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <CameraAction {...props} />
      </View>
      <View style={{ width: 100 }}>
        <ReverseButton
          cameraTools={cameraTools}
          handleReverse={handleReverse}
          meta={meta}
        />
      </View>
    </View>
  );
});

const CameraAction = observer((props: any) => {
  const { imageSnap, meta, value, editable } = props;
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
        paddingHorizontal: 0,
        paddingVertical: 0,
        position: "absolute",
        margin: 0,
      }}
      disabled={meta.loading}
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
        {!!meta.tempValue && !meta.snap && (
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
  const { meta, camera, bg, cameraProps } = props;
  const dim = Dimensions.get("window");
  const ratio = get(libsStorage, "camera.ratio", "16:9").split(":"),
    width = dim.width,
    height = dim.width * (ratio[0] / ratio[1]);
  const preview = !!meta.tempValue && !meta.snap && !meta.loading;
  const source = {
    uri: meta.tempValue,
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {!!meta.loading && (
        <View
          style={{
            backgroundColor: "rgba(255,255,255,0.6)",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            padding: 5,
            position: "absolute",
            zIndex: 99,
            alignSelf: "center",
            height: "30%",
            width: "100%",
          }}
        >
          <Spinner color={Theme.UIColors.text} />
          <Text
            style={{
              marginLeft: 10,
              fontSize: 16,
            }}
          >
            Processing...
          </Text>
        </View>
      )}
      {!!preview ? (
        <Image
          source={source}
          resizeMode={"cover"}
          style={{
            height,
            width,
          }}
        />
      ) : (
        <Camera
          {...cameraProps}
          {...toJS(libsStorage.camera)}
          style={{
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "transparent",
            width,
            height,
          }}
          ref={camera}
        ></Camera>
      )}
      <Animated.View
        style={{
          position: "absolute",
          backgroundColor: bg,
          width,
          height,
        }}
      />
    </View>
  );
});
