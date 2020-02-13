import _ from "lodash";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { Image, ImageProps as ImagePropsOrigin } from "react-native";
import Spinner from "../Spinner";
import View from "../View";
import Modal from "../Modal";
import Button from "../Button";
import Icon from "../Icon";

const errorSource = require("@src/assets/images/404.png");
const loadingSource = require("@src/assets/images/loading.png");
export interface ImageProps extends ImagePropsOrigin {
  loadingSize?: "small" | "large";
  preview?: boolean;
}

export default observer((props: ImageProps) => {
  const [error, setError] = useState(false);
  const [show, setShow] = useState(false);
  const { source, preview } = props;
  let csource = source;
  if (typeof csource === "object") {
    csource = {
      cache: "force-cache",
      ...(source as any)
    };
  }

  const btnStyle = {
    padding: 0,
    margin: 0,
    paddingLeft: 0,
    paddingRight: 0,
    backgroundColor: "transparent"
  };

  const onPress = () => {
    setShow(!show);
  };

  return (
    <>
      {!error ? (
        <Button
          activeOpacity={preview ? 0.7 : 1}
          style={btnStyle}
          disabled={!preview}
          onPress={onPress}
        >
          <Image
            defaultSource={loadingSource}
            resizeMode={"contain"}
            {...props}
            source={csource}
            onError={e => {
              if (_.get(e, "nativeEvent.error", "")) {
                setError(true);
              }
            }}
          />
        </Button>
      ) : (
        <Image
          defaultSource={errorSource}
          resizeMode={"contain"}
          source={errorSource}
          style={props.style}
        />
      )}
      {!!show && (
        <PreviewImage show={show} setShow={setShow} imgProps={props} />
      )}
    </>
  );
});

const PreviewImage = observer((props: any) => {
  const { show, setShow, imgProps } = props;
  const onRequestClose = () => {
    setShow(!show);
  };
  return (
    <Modal visible={show} onRequestClose={onRequestClose}>
      <View
        style={{
          backgroundColor: "rgba(0,0,0,0.6)",
          flexShrink: 1,
          flexGrow: 1,
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Image
          {...imgProps}
          resizeMode={"cover"}
          style={{
            width: "100%",
            height: "100%"
          }}
        />

        <Button
          style={{
            width: 50,
            height: 50,
            position: "absolute",
            top: 10,
            left: 10,
            backgroundColor: "rgba(255,255,255,0.5)",
            borderRadius: 99,
            padding: 0,
            paddingLeft: 0,
            paddingRight: 0
          }}
          onPress={onRequestClose}
        >
          <Icon
            source={"AntDesign"}
            name={"arrowleft"}
            size={30}
            style={{
              margin: 5
            }}
          />
        </Button>
      </View>
    </Modal>
  );
});

const RenderImage = observer((props: any) => {
  const { imgProps, meta } = props;
  if (meta.status === "init" || meta.status === "ready") {
    return null;
  }
  return (
    <>
      {meta.status === "loading" ? (
        <View
          style={{
            ..._.get(imgProps, "style", {}),
            justifyContent: "center",
            alignItems: "center",
            position: "absolute",
            top: 0
          }}
        >
          <Spinner
            size={imgProps.loadingSize ? imgProps.loadingSize : "large"}
          />
        </View>
      ) : (
        <View
          style={{
            ..._.get(imgProps, "style", {}),
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <Image
            resizeMode={"contain"}
            source={errorSource}
            style={_.get(imgProps, "style", {})}
          />
        </View>
      )}
    </>
  );
});
