import _ from "lodash";
import { observer } from "mobx-react-lite";
import React from "react";
import {
  StatusBar,
  StatusBarProps,
  StyleSheet,
  ViewProps,
  ViewStyle,
} from "react-native";
import Theme from "../../theme";
import libsStorage from "../store";
import View from "../View";

interface IStyles {
  statusbar?: ViewStyle;
}

export interface IScreenProps extends ViewProps {
  children?: any;
  styles?: IStyles;
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
      <View type={"SafeAreaView"} {...props} style={cstyle}>
        {props.children}
        {!!libsStorage.toast && libsStorage.toast()}
      </View>
    </>
  );
});

const show = (component: () => any, duration: number = 0) => {
  libsStorage.toast = component;
  if (duration > 0) {
    setTimeout(() => {
      libsStorage.toast = null;
    }, duration);
  }
};

const dismiss = () => {
  libsStorage.toast = null;
};

export const Toast = {
  show,
  dismiss,
};
