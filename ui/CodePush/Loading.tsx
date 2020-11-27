import React from "react";
import { Dimensions } from "react-native";
import Theme from "../../config/theme";
import Image from "../Image";
import Screen from "../Screen";
import Spinner from "../Spinner";
import Text from "../Text";
import View from "../View";

export default (props: any) => {
  const dim = Dimensions.get("window");
  let message = props.syncMessage;
  let progress = "";
  if (!!props.progress) {
    let dl = (props.progress.receivedBytes / props.progress.totalBytes) * 100;
    progress = `(${dl.toFixed(1)}%)`;
  }

  return (
    <Screen>
      <View
        style={{
          backgroundColor: "#fff",
          flexGrow: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
        type={"View"}
      >
        <Image
          source={Theme.UISplashScreen}
          style={{
            width: "100%",
            height: dim.height,
            marginBottom: 20,
          }}
          disableLoading={true}
        />
        <View
          style={{
            position: "absolute",
            bottom: 50,
            left: 20,
            right: 20,
            justifyContent: "center",
            alignItems: "center",
            padding: 15,
            flexDirection: "row",
          }}
        >
          <Spinner
            style={{
              alignSelf: "center",
            }}
            color={Theme.UIColors.primary}
          ></Spinner>
          <Text
            style={{
              fontSize: 13,
              marginLeft: 10,
            }}
          >
            {message}
            {progress}
          </Text>
        </View>
      </View>
    </Screen>
  );
};
