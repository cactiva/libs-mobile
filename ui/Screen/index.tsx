import get from "lodash.get";
import { observer } from "mobx-react-lite";
import React, { ReactNode } from "react";
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StatusBarProps,
  StyleSheet,
} from "react-native";
import { SafeAreaViewProps } from "react-native-safe-area-context";
import Theme from "../../config/theme";
import View from "../View";

export interface IScreenProps extends SafeAreaViewProps {
  children?: ReactNode;
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
    <SafeAreaView {...props} style={cstyle}>
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
    </SafeAreaView>
  );
});
