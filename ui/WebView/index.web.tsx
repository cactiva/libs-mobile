import React from "react";
import Text from "../Text";
import { WebViewProps } from "react-native-webview";

export default (props: WebViewProps) => {
  const { source, style }: any = props;
  let src = source.uri;
  if (source.html) {
    src = "data:text/html," + encodeURIComponent(src);
  }
  return (
    <iframe
      src={src}
      style={{
        borderWidth: 0,
        ...style
      }}
    />
  );
};
