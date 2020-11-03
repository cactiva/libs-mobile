import React from "react";
import { Dimensions } from "react-native";
import Theme from "../../config/theme";
import Image from "../Image";
import Screen from "../Screen";
import Spinner from "../Spinner";
import View from "../View";

export default () => {
  const dim = Dimensions.get("window");

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
            width: dim.width,
            height: dim.width / 2,
            marginBottom: 20,
          }}
          disableLoading
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
          }}
        >
          <Spinner
            style={{
              alignSelf: "center",
            }}
            color={Theme.UIColors.primary}
          ></Spinner>
        </View>
      </View>
    </Screen>
  );
};
