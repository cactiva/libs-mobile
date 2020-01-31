import _ from "lodash";
import { observer } from "mobx-react-lite";
import React, { useState } from "react";
import { Image, ImageProps as ImagePropsOrigin } from "react-native";
import Spinner from "../Spinner";
import View from "../View";

const errorSource = require("@src/assets/images/404.png");
const loadingSource = require("@src/assets/images/loading.png");
export interface ImageProps extends ImagePropsOrigin {
  loadingSize?: "small" | "large";
}

export default observer((props: ImageProps) => {
  const [error, setError] = useState(false);
  const { source } = props;
  let csource = source;
  if (typeof csource === "object") {
    csource = {
      cache: "force-cache",
      ...(source as any)
    };
  }

  return (
    <>
      {!error ? (
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
      ) : (
        <Image
          defaultSource={errorSource}
          resizeMode={"contain"}
          source={errorSource}
          style={props.style}
        />
      )}
    </>
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
