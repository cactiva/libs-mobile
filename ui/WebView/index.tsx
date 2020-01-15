import React from "react";
import { WebView, WebViewProps } from "react-native-webview";

export default (props: WebViewProps) => {
  return (
    <WebView
      originWhitelist={["*"]}
      scalesPageToFit={true}
      textZoom={100}
      javaScriptEnabled={false}
      domStorageEnabled={true}
      {...props}
    />
  );
};
