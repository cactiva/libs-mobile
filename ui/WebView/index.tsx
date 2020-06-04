import React from "react";
import { WebView, WebViewProps } from "react-native-webview";
import View from "../View";
import Image, { IImageProps } from "../Image";
import Theme from "../../theme";
import Spinner from "../Spinner";
import _ from "lodash";
import { Dimensions } from "react-native";

export interface IWebViewProps extends WebViewProps {
  loadingImage?: IImageProps;
}

export default (props: IWebViewProps) => {
  return (
    <WebView
      originWhitelist={["*", "intent://*"]}
      scalesPageToFit={true}
      textZoom={100}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      startInLoadingState
      allowFileAccess={true}
      geolocationEnabled={true}
      saveFormDataDisabled={true}
      allowUniversalAccessFromFileURLs={true}
      cacheEnabled={true}
      renderLoading={() => <LoadingScreen webViewProps={props} />}
      {...props}
    />
  );
};

const LoadingScreen = (props: any) => {
  const dim = Dimensions.get("window");
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
        right: 0,
      }}
    >
      <Image
        source={Theme.UIImageLoading}
        style={{
          width: dim.width,
          height: dim.width / 2,
          marginBottom: 20,
        }}
        {..._.get(props, "webViewProps.loadingImage")}
      ></Image>
      <Spinner
        size={"large"}
        style={{
          alignSelf: "center",
        }}
        color={"#fff"}
      ></Spinner>
    </View>
  );
};
