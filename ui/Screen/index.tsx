import set from "lodash.set";
import get from "lodash.get";
import { observer } from "mobx-react-lite";
import React from "react";
import { Platform, StatusBar, StatusBarProps, StyleSheet } from "react-native";
import Theme from "../../config/theme";
import View, { IViewProps } from "../View";

export interface IScreenProps extends IViewProps {
  children?: any;
  scrollRef?: any;
  statusBar?: StatusBarProps;
}

export const statusBarHeight: number =
  Platform.OS === "android" && !!StatusBar.currentHeight
    ? StatusBar.currentHeight
    : 0;

export default observer((props: IScreenProps) => {
  const { style, statusBar, scrollRef } = props;
  let cstyle = StyleSheet.flatten([
    {
      flexGrow: 1,
      flexShrink: 1,
      backgroundColor: Theme.UIColors.background,
      padding: 0,
      margin: 0,
    },
    style,
  ]);
  return (
    <View type={"SafeAreaView"} {...props} style={cstyle}>
      <View
        style={{
          height: statusBarHeight,
          position: "absolute",
          top: 0,
        }}
      >
        <StatusBar
          backgroundColor={get(
            statusBar,
            "backgroundColor",
            Theme.StatusBarBackgroundColor
          )}
          barStyle={get(statusBar, "barStyle", Theme.StatusBarStyle as any)}
          animated={true}
          translucent={true}
        />
      </View>
      {props.children}
    </View>
  );
});
