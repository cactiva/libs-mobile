import React, { useState } from "react";
import {
  Image,
  ImageProps as OriginImageProps,
  StyleSheet,
  ImageStyle
} from "react-native";
import _ from "lodash";
import Theme from "../../theme";

export interface IImageProps extends OriginImageProps {}

export default (props: IImageProps) => {
  const { style, source } = props;
  const [error, setError] = useState(false);
  const baseStyle: ImageStyle = {
    margin: 4,
    width: 300,
    height: 150
  };
  const cstyle = StyleSheet.flatten([baseStyle, style]);
  let csource: any = source;
  if (typeof source === "object") {
    csource = {
      ...source,
      cache: "force-cache"
    };
  }

  return (
    <>
      {error ? (
        <Image
          resizeMode={"contain"}
          defaultSource={Theme.UIImageLoading}
          {...props}
          source={csource}
          style={cstyle}
          onError={e => {
            const err = _.get(e, "mativeEvent.error", "");
            if (!!err) setError(true);
          }}
        />
      ) : (
        <Image
          resizeMode={"contain"}
          defaultSource={Theme.UIImageLoading}
          {...props}
          source={csource}
          style={cstyle}
        />
      )}
    </>
  );
};
