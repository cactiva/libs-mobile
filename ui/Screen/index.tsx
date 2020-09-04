import _ from "lodash";
import { observer } from "mobx-react-lite";
import React from "react";
import { StatusBar, StatusBarProps, StyleSheet, ViewProps } from "react-native";
import Theme from "../../theme";
import View from "../View";

export interface IScreenProps extends ViewProps {
  children?: any;
  statusBar?: StatusBarProps;
}

export default observer((props: IScreenProps) => {
  const { style, statusBar } = props;
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
    <>
      <StatusBar
        backgroundColor={_.get(
          statusBar,
          "backgroundColor",
          Theme.StatusBarBackgroundColor
        )}
        barStyle={_.get(statusBar, "barStyle", Theme.StatusBarStyle as any)}
        animated={true}
      />
      <View type={"SafeAreaView"} {...props} style={cstyle}></View>
    </>
  );
});
