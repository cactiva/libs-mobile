import React from "react";
import { WebView, WebViewProps } from "react-native-webview";
import View from "../View";
import Image from "../Image";
import Theme from "@src/libs/theme";
import Spinner from "../Spinner";

export default (props: WebViewProps) => {
  return (
    <WebView
      originWhitelist={["*"]}
      scalesPageToFit={true}
      textZoom={100}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      {...props}
      renderLoading={LoadingScreen}
    />
  );
};

const LoadingScreen = () => {
  return (
    <View
      style={{
        backgroundColor: Theme.UIColors.primary,
        flexGrow: 1,
        alignItems: "center",
        justifyContent: "center"
      }}
      type={"View"}
    >
      <Image
        source={Theme.UIImageLoading}
        style={{
          width: 120,
          height: 50,
          marginBottom: 20
        }}
      ></Image>
      <Spinner
        size={"large"}
        style={{
          alignSelf: "center"
        }}
        color={"#fff"}
      ></Spinner>
    </View>
  );
};
