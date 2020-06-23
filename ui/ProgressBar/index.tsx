import React from "react";
import {
  Platform,
  ProgressViewIOS,
  ProgressViewIOSProps,
  ProgressBarAndroidProps,
  ProgressBarAndroid,
} from "react-native";

export interface IProgressBar
  extends ProgressViewIOSProps,
    ProgressBarAndroidProps {}

export default (props: IProgressBar) => {
  if (Platform.OS === "ios") {
    return <ProgressViewIOS {...props} progressTintColor={props.color} />;
  }

  return <ProgressBarAndroid {...props} styleAttr="Horizontal" />;
};
