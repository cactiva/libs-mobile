import { createBrowserApp } from "@react-navigation/web";
import { createStackNavigator } from "react-navigation-stack";
import { useDimensions } from "react-native-hooks";
import React from "react";
import components, { initialRouteName } from "@src/components";
import { Animated, Easing } from "react-native";

const theme = require("../theme.json");

export const AppContainer = () => {
  const App = createBrowserApp(
    createStackNavigator(components, {
      headerMode: "none",
      initialRouteName: initialRouteName
    })
  );

  return () => {
    if (theme.device === "mobile") {
      const dim = useDimensions().window;
      if (dim.width > 460)
        return (
          <div className="mobile-root">
            <App />
          </div>
        );
    }

    return (
      <div className="web-root">
        <App />
      </div>
    );
  };
};
