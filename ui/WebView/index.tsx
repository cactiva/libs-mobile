import React from "react";
import { WebView, WebViewProps } from "react-native-webview";
import View from "../View";
import Image from "../Image";
import Theme from "@src/libs/theme";
import Spinner from "../Spinner";

export interface IWebViewProps extends WebViewProps {
  loadingSource?: any;
}

export default (props: IWebViewProps) => {
  const { loadingSource } = props;
  return (
    <WebView
      originWhitelist={["*", "intent://*"]}
      scalesPageToFit={true}
      textZoom={100}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      {...props}
      renderLoading={() => <LoadingScreen source={loadingSource} />}
      startInLoadingState
      allowFileAccess={true}
      geolocationEnabled={true}
      saveFormDataDisabled={true}
      allowUniversalAccessFromFileURLs={true}
      cacheEnabled={true}
    />
  );
};

const LoadingScreen = ({ source }) => {
  return (
    <View
      style={{
        backgroundColor: Theme.UIColors.primary,
        alignItems: "center",
        justifyContent: "center",
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      }}
      type={"View"}
    >
      <Image
        source={source || Theme.UIImageLoading}
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
