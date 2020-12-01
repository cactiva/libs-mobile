import { observer } from "mobx-react-lite";
import React, { ReactNode } from "react";
import {
  ScrollView,
  ScrollViewProps,
  StyleSheet,
  View,
  ViewProps,
} from "react-native";
import Theme from "../../config/theme";

export interface IViewProps extends ViewProps, ScrollViewProps {
  type?: "View" | "ScrollView";
  shadow?: boolean;
  childRef?: any;
  children?: ReactNode;
}

export default observer((props: IViewProps) => {
  const { type, shadow, style, childRef } = props;
  const shadowStyle = !!shadow ? Theme.UIShadow : {};
  let cstyle = StyleSheet.flatten([shadowStyle, style]);

  switch (type) {
    case "ScrollView":
      return (
        <ScrollView
          {...props}
          ref={childRef}
          keyboardShouldPersistTaps={"handled"}
          style={cstyle}
        />
      );
    default:
      return <View {...props} style={cstyle} ref={childRef} />;
  }
});
